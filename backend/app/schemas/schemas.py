from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "Multiple Failed Logins Followed by DB Access"})
    description: str = Field(..., json_schema_extra={"example": "Suspicious authentication activity detected on database server"})
    severity: str = Field(default="HIGH", json_schema_extra={"example": "HIGH"})
    source_ip: Optional[str] = Field(default="198.51.100.45", json_schema_extra={"example": "198.51.100.45"})
    dest_ip: Optional[str] = Field(default="192.0.2.10", json_schema_extra={"example": "192.0.2.10"})
    affected_account: Optional[str] = Field(default="svc_db_sync", json_schema_extra={"example": "svc_db_sync"})
    affected_service: Optional[str] = Field(default="PostgreSQL Prod", json_schema_extra={"example": "PostgreSQL Prod"})
    event_type: Optional[str] = Field(default="Credential Compromise", json_schema_extra={"example": "Credential Compromise"})
    raw_logs: Optional[str] = Field(default="", json_schema_extra={"example": "2026-09-28 08:14:02 sshd[4412]: Failed password..."})
    additional_context: Optional[str] = Field(default="", json_schema_extra={"example": "Service account restriction..."})
    is_demo: bool = False

class IncidentEventRead(BaseModel):
    id: int
    timestamp: Optional[str] = None
    log_level: str
    message: str
    source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class HindsightMemoryItem(BaseModel):
    memory_id: str
    incident_id: Optional[str] = None
    title: str
    incident_type: str
    severity: str
    pattern: str
    root_cause: str
    remediation: str
    outcome: str
    analyst_feedback: str
    why_relevant: str
    relevance_score: Optional[float] = None
    timestamp: str
    source: str = "hindsight_live" # "hindsight_live" or "hindsight_demo"

class StructuredIncidentAnalysis(BaseModel):
    severity: str = Field(..., json_schema_extra={"example": "HIGH"})
    incident_type: str = Field(..., json_schema_extra={"example": "Credential Compromise"})
    confidence: float = Field(default=0.87, ge=0.0, le=1.0)
    summary: str
    indicators: List[str] = []
    attack_techniques: List[str] = []
    possible_root_causes: List[str] = []
    recommended_actions: List[str] = []
    evidence: List[str] = []
    memory_query: str
    
    # Hindsight Memory-Aware Reasoning Enhancements
    has_historical_memory: bool = False
    recalled_memories: List[HindsightMemoryItem] = []
    historical_context_summary: Optional[str] = None
    similarities: List[str] = []
    differences: List[str] = []
    reasoning: Optional[str] = None
    warnings: List[str] = []

class IncidentAnalysisRead(StructuredIncidentAnalysis):
    id: int
    incident_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentResolveRequest(BaseModel):
    root_cause: str = Field(..., json_schema_extra={"example": "Compromised service account credentials"})
    actions_taken: str = Field(..., json_schema_extra={"example": "Disabled service account, rotated secrets, blocked IP"})
    remediation: str = Field(..., json_schema_extra={"example": "Disable service account immediately, rotate credentials"})
    outcome: str = Field(..., json_schema_extra={"example": "Incident resolved, malicious access halted"})
    analyst_feedback: str = Field(..., json_schema_extra={"example": "Disabling service account immediately stopped unauthorized DB querying"})

class IncidentResolutionRead(IncidentResolveRequest):
    id: int
    incident_id: str
    hindsight_memory_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MemoryReferenceRead(BaseModel):
    id: int
    incident_id: str
    recalled_incident_id: Optional[str] = None
    memory_id: str
    recall_query: str
    relevance_score: Optional[float] = None
    why_relevant: str
    root_cause: Optional[str] = None
    remediation: Optional[str] = None
    outcome: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AgentTraceStep(BaseModel):
    step_number: int
    title: str
    description: str
    status: str # "completed", "in_progress", "pending", "failed"
    timestamp: str
    details: Optional[Dict[str, Any]] = None

class AgentExecutionRead(BaseModel):
    id: str
    incident_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    steps: List[AgentTraceStep] = []
    memory_queried: Optional[str] = None
    memory_found: bool = False
    memory_count: int = 0
    reasoning_summary: Optional[str] = None
    errors: List[str] = []

class IncidentRead(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    status: str
    source_ip: Optional[str] = None
    dest_ip: Optional[str] = None
    affected_account: Optional[str] = None
    affected_service: Optional[str] = None
    event_type: Optional[str] = None
    raw_logs: Optional[str] = None
    additional_context: Optional[str] = None
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    
    events: List[IncidentEventRead] = []
    analysis: Optional[IncidentAnalysisRead] = None
    resolution: Optional[IncidentResolutionRead] = None
    memory_references: List[MemoryReferenceRead] = []

    model_config = ConfigDict(from_attributes=True)

class SystemStatusResponse(BaseModel):
    agent_status: str
    hindsight_status: str
    hindsight_bank_id: str
    llm_status: str
    llm_model: str
    database_status: str
    total_incidents: int
    resolved_incidents: int
    total_memories: int
    app_env: str
