import json
import logging
import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.models import Incident, IncidentAnalysis, AgentExecution, MemoryReference, IncidentResolution
from app.schemas.schemas import StructuredIncidentAnalysis, HindsightMemoryItem, AgentTraceStep
from app.hindsight.memory_service import MemoryService
from app.llm.client import LLMClient

logger = logging.getLogger("memorysec.agent")

class IncidentResponseAgent:
    """
    Core AI Incident Response Agent Orchestrator.
    Executes the complete investigation lifecycle with Hindsight Memory Integration.
    """

    def __init__(self, db: Session):
        self.db = db
        self.memory_service = MemoryService(db=db)
        self.llm_client = LLMClient()

    async def run_investigation(self, incident_id: str) -> StructuredIncidentAnalysis:
        """
        Run end-to-end incident investigation pipeline for an incident.
        """
        incident = self.db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        execution_id = f"exec-{uuid.uuid4().hex[:8]}"
        start_time = datetime.datetime.utcnow()
        trace_steps: List[AgentTraceStep] = []

        def add_trace(step_num: int, title: str, desc: str, status: str = "completed", details: Optional[Dict] = None):
            trace_steps.append(AgentTraceStep(
                step_number=step_num,
                title=title,
                description=desc,
                status=status,
                timestamp=datetime.datetime.utcnow().isoformat(),
                details=details
            ))

        # STEP 1: Parse Incident & Extract Indicators
        add_trace(1, "Parse Incident & Extract Indicators", f"Parsed incident metadata for '{incident.title}'")
        incident_dict = {
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity,
            "source_ip": incident.source_ip,
            "dest_ip": incident.dest_ip,
            "affected_account": incident.affected_account,
            "affected_service": incident.affected_service,
            "event_type": incident.event_type,
            "raw_logs": incident.raw_logs,
            "additional_context": incident.additional_context
        }

        # STEP 2: Generate Hindsight Query & Search Historical Memory
        search_query = (
            f"Find previous incidents involving {incident.event_type or 'suspicious activity'}, "
            f"failed logins, privilege escalation, compromised account '{incident.affected_account}', "
            f"and service '{incident.affected_service}'."
        )
        add_trace(2, "Query Hindsight Memory Bank", f"Formulated memory query: '{search_query[:70]}...'")

        # STEP 3: Recall Hindsight Memories
        recalled_memories = await self.memory_service.recall_experiences(search_query, limit=3)
        memory_found = len(recalled_memories) > 0
        memory_count = len(recalled_memories)

        if memory_found:
            top_mem = recalled_memories[0]
            add_trace(
                3,
                "Hindsight Memory Recalled",
                f"Found {memory_count} relevant historical incident memory. Matched '{top_mem.incident_id or top_mem.title}'",
                details={
                    "recalled_incident_id": top_mem.incident_id,
                    "why_relevant": top_mem.why_relevant,
                    "relevance_score": top_mem.relevance_score,
                    "root_cause": top_mem.root_cause,
                    "remediation": top_mem.remediation
                }
            )
        else:
            add_trace(3, "Hindsight Memory Queried", "No relevant historical incident memory found in Hindsight bank.")

        # STEP 4: Memory-Aware Reasoning & LLM Assessment
        add_trace(4, "Memory-Aware Reasoning", "Combining current evidence with Hindsight memory context for LLM reasoning.")
        analysis_result = await self.llm_client.analyze_incident(incident_dict, recalled_memories)

        # STEP 5: Store Memory References & Analysis in Local DB
        # Clear existing references for fresh run
        self.db.query(MemoryReference).filter(MemoryReference.incident_id == incident_id).delete()
        for mem in recalled_memories:
            mem_ref = MemoryReference(
                incident_id=incident_id,
                recalled_incident_id=mem.incident_id,
                memory_id=mem.memory_id,
                recall_query=search_query,
                relevance_score=mem.relevance_score,
                why_relevant=mem.why_relevant,
                root_cause=mem.root_cause,
                remediation=mem.remediation,
                outcome=mem.outcome
            )
            self.db.add(mem_ref)

        # Update or create IncidentAnalysis in DB
        existing_analysis = self.db.query(IncidentAnalysis).filter(IncidentAnalysis.incident_id == incident_id).first()
        if existing_analysis:
            existing_analysis.severity = analysis_result.severity
            existing_analysis.incident_type = analysis_result.incident_type
            existing_analysis.confidence = analysis_result.confidence
            existing_analysis.summary = analysis_result.summary
            existing_analysis.indicators_json = json.dumps(analysis_result.indicators)
            existing_analysis.attack_techniques_json = json.dumps(analysis_result.attack_techniques)
            existing_analysis.possible_root_causes_json = json.dumps(analysis_result.possible_root_causes)
            existing_analysis.recommended_actions_json = json.dumps(analysis_result.recommended_actions)
            existing_analysis.evidence_json = json.dumps(analysis_result.evidence)
            existing_analysis.memory_query = search_query
            existing_analysis.has_historical_memory = memory_found
        else:
            new_analysis = IncidentAnalysis(
                incident_id=incident_id,
                severity=analysis_result.severity,
                incident_type=analysis_result.incident_type,
                confidence=analysis_result.confidence,
                summary=analysis_result.summary,
                indicators_json=json.dumps(analysis_result.indicators),
                attack_techniques_json=json.dumps(analysis_result.attack_techniques),
                possible_root_causes_json=json.dumps(analysis_result.possible_root_causes),
                recommended_actions_json=json.dumps(analysis_result.recommended_actions),
                evidence_json=json.dumps(analysis_result.evidence),
                memory_query=search_query,
                has_historical_memory=memory_found
            )
            self.db.add(new_analysis)

        # Update Incident status
        if incident.status == "OPEN":
            incident.status = "INVESTIGATING"

        add_trace(5, "Response Recommendations Generated", "Formulated context-aware response plan.")
        add_trace(6, "Awaiting Analyst Action", "Analysis complete. Standing by for security analyst review and resolution.", status="in_progress")

        # Record Agent Execution trace
        execution_record = AgentExecution(
            id=execution_id,
            incident_id=incident_id,
            started_at=start_time,
            completed_at=datetime.datetime.utcnow(),
            status="COMPLETED",
            steps_json=json.dumps([step.model_dump() for step in trace_steps]),
            memory_queried=search_query,
            memory_found=memory_found,
            memory_count=memory_count,
            memory_ids_json=json.dumps([m.memory_id for m in recalled_memories]),
            reasoning_summary=analysis_result.reasoning
        )
        self.db.add(execution_record)
        self.db.commit()

        return analysis_result

    async def resolve_and_retain(
        self,
        incident_id: str,
        root_cause: str,
        actions_taken: str,
        remediation: str,
        outcome: str,
        analyst_feedback: str
    ) -> Dict[str, Any]:
        """
        Resolve incident and retain experience in Hindsight.
        Completes the learning loop!
        """
        incident = self.db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        # Save or update resolution in DB
        existing_res = self.db.query(IncidentResolution).filter(IncidentResolution.incident_id == incident_id).first()
        if existing_res:
            existing_res.root_cause = root_cause
            existing_res.actions_taken = actions_taken
            existing_res.remediation = remediation
            existing_res.outcome = outcome
            existing_res.analyst_feedback = analyst_feedback
            res_record = existing_res
        else:
            res_record = IncidentResolution(
                incident_id=incident_id,
                root_cause=root_cause,
                actions_taken=actions_taken,
                remediation=remediation,
                outcome=outcome,
                analyst_feedback=analyst_feedback
            )
            self.db.add(res_record)

        incident.status = "RESOLVED"
        incident.updated_at = datetime.datetime.utcnow()

        # Get attack techniques from analysis if available
        attack_techs = []
        if incident.analysis and incident.analysis.attack_techniques_json:
            try:
                attack_techs = json.loads(incident.analysis.attack_techniques_json)
            except Exception:
                pass

        # Retain experience in Hindsight
        hindsight_result = await self.memory_service.retain_experience(
            incident_id=incident.id,
            title=incident.title,
            incident_type=incident.analysis.incident_type if incident.analysis else (incident.event_type or "Security Event"),
            severity=incident.severity,
            pattern=f"{incident.title} - {incident.description}",
            root_cause=root_cause,
            remediation=remediation,
            outcome=outcome,
            analyst_feedback=analyst_feedback,
            affected_account=incident.affected_account,
            affected_service=incident.affected_service,
            attack_techniques=attack_techs
        )

        res_record.hindsight_memory_id = hindsight_result.get("memory_id")

        # Update last agent execution trace step to completed
        last_exec = (
            self.db.query(AgentExecution)
            .filter(AgentExecution.incident_id == incident_id)
            .order_by(AgentExecution.started_at.desc())
            .first()
        )
        if last_exec and last_exec.steps_json:
            try:
                steps = json.loads(last_exec.steps_json)
                steps.append({
                    "step_number": 7,
                    "title": "Incident Resolved & Experience Retained",
                    "description": f"Retained experience in Hindsight (Memory ID: {hindsight_result.get('memory_id')})",
                    "status": "completed",
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "details": hindsight_result
                })
                last_exec.steps_json = json.dumps(steps)
            except Exception:
                pass

        self.db.commit()

        return {
            "status": "SUCCESS",
            "message": f"Incident {incident_id} successfully resolved and retained in Hindsight memory.",
            "incident_id": incident_id,
            "hindsight_memory_id": hindsight_result.get("memory_id"),
            "memory_source": hindsight_result.get("source")
        }
