import json
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.services.database import get_db
from app.models.models import Incident, IncidentEvent, IncidentAnalysis, IncidentResolution, AgentExecution, MemoryReference
from app.schemas.schemas import (
    IncidentCreate, IncidentRead, StructuredIncidentAnalysis,
    IncidentResolveRequest, HindsightMemoryItem, AgentExecutionRead, AgentTraceStep
)
from app.agents.orchestrator import IncidentResponseAgent

router = APIRouter(prefix="/incidents", tags=["Incidents"])

def generate_incident_id(db: Session) -> str:
    count = db.query(Incident).count() + 1040
    return f"INC-{count}"

@router.post("", response_model=IncidentRead, status_code=201)
async def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    """Submit a new cybersecurity incident for investigation."""
    inc_id = generate_incident_id(db)
    
    # Avoid duplicate IDs
    while db.query(Incident).filter(Incident.id == inc_id).first():
        num = int(inc_id.split("-")[1]) + 1
        inc_id = f"INC-{num}"

    incident = Incident(
        id=inc_id,
        title=payload.title,
        description=payload.description,
        severity=payload.severity.upper(),
        status="OPEN",
        source_ip=payload.source_ip,
        dest_ip=payload.dest_ip,
        affected_account=payload.affected_account,
        affected_service=payload.affected_service,
        event_type=payload.event_type,
        raw_logs=payload.raw_logs,
        additional_context=payload.additional_context,
        is_demo=payload.is_demo,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(incident)
    
    # Parse raw logs into initial log events
    if payload.raw_logs:
        log_lines = [l.strip() for l in payload.raw_logs.split("\n") if l.strip()]
        for line in log_lines[:10]: # Store top log entries
            event = IncidentEvent(
                incident_id=inc_id,
                timestamp=datetime.datetime.utcnow().isoformat(),
                log_level="WARN" if "failed" in line.lower() or "error" in line.lower() else "INFO",
                message=line[:255],
                source="Raw Log Ingestion"
            )
            db.add(event)

    db.commit()
    db.refresh(incident)
    return incident

@router.get("", response_model=List[IncidentRead])
async def list_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve list of incidents with optional filtering."""
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status.upper())
    if severity:
        query = query.filter(Incident.severity == severity.upper())
    
    incidents = query.order_by(Incident.created_at.desc()).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentRead)
async def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Retrieve complete incident details by ID."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return incident

@router.post("/{incident_id}/analyze", response_model=StructuredIncidentAnalysis)
async def analyze_incident(incident_id: str, db: Session = Depends(get_db)):
    """Trigger AI Incident Response Agent investigation & Hindsight memory recall."""
    agent = IncidentResponseAgent(db=db)
    try:
        analysis = await agent.run_investigation(incident_id)
        return analysis
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent investigation error: {str(e)}")

@router.post("/{incident_id}/resolve")
async def resolve_incident(
    incident_id: str,
    payload: IncidentResolveRequest,
    db: Session = Depends(get_db)
):
    """Resolve incident and retain experience in Hindsight."""
    agent = IncidentResponseAgent(db=db)
    try:
        result = await agent.resolve_and_retain(
            incident_id=incident_id,
            root_cause=payload.root_cause,
            actions_taken=payload.actions_taken,
            remediation=payload.remediation,
            outcome=payload.outcome,
            analyst_feedback=payload.analyst_feedback
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Incident resolution error: {str(e)}")

@router.get("/{incident_id}/agent-execution", response_model=AgentExecutionRead)
async def get_agent_execution_trace(incident_id: str, db: Session = Depends(get_db)):
    """Get latest agent execution step trace for an incident."""
    execution = (
        db.query(AgentExecution)
        .filter(AgentExecution.incident_id == incident_id)
        .order_by(AgentExecution.started_at.desc())
        .first()
    )
    if not execution:
        raise HTTPException(status_code=404, detail=f"No agent execution trace found for {incident_id}")

    steps = []
    if execution.steps_json:
        try:
            raw_steps = json.loads(execution.steps_json)
            steps = [AgentTraceStep(**s) for s in raw_steps]
        except Exception:
            pass

    errors = []
    if execution.errors_json:
        try:
            errors = json.loads(execution.errors_json)
        except Exception:
            pass

    return AgentExecutionRead(
        id=execution.id,
        incident_id=execution.incident_id,
        started_at=execution.started_at,
        completed_at=execution.completed_at,
        status=execution.status,
        steps=steps,
        memory_queried=execution.memory_queried,
        memory_found=execution.memory_found,
        memory_count=execution.memory_count,
        reasoning_summary=execution.reasoning_summary,
        errors=errors
    )
