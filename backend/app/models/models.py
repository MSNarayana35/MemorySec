import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.services.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(50), primary_key=True, index=True) # e.g. INC-1042
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(20), default="OPEN") # OPEN, INVESTIGATING, RESOLVED
    source_ip = Column(String(45), nullable=True)
    dest_ip = Column(String(45), nullable=True)
    affected_account = Column(String(100), nullable=True)
    affected_service = Column(String(100), nullable=True)
    event_type = Column(String(100), nullable=True)
    raw_logs = Column(Text, nullable=True)
    additional_context = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    events = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan")
    analysis = relationship("IncidentAnalysis", back_populates="incident", uselist=False, cascade="all, delete-orphan")
    resolution = relationship("IncidentResolution", back_populates="incident", uselist=False, cascade="all, delete-orphan")
    agent_executions = relationship("AgentExecution", back_populates="incident", cascade="all, delete-orphan")
    memory_references = relationship("MemoryReference", back_populates="incident", cascade="all, delete-orphan")


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(50), ForeignKey("incidents.id"), nullable=False)
    timestamp = Column(String(50), nullable=True)
    log_level = Column(String(20), default="INFO")
    message = Column(Text, nullable=False)
    source = Column(String(100), nullable=True)

    incident = relationship("Incident", back_populates="events")


class IncidentAnalysis(Base):
    __tablename__ = "incident_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(50), ForeignKey("incidents.id"), nullable=False, unique=True)
    severity = Column(String(20), nullable=False)
    incident_type = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.85)
    summary = Column(Text, nullable=False)
    indicators_json = Column(Text, nullable=True) # JSON string
    attack_techniques_json = Column(Text, nullable=True) # JSON string
    possible_root_causes_json = Column(Text, nullable=True) # JSON string
    recommended_actions_json = Column(Text, nullable=True) # JSON string
    evidence_json = Column(Text, nullable=True) # JSON string
    memory_query = Column(Text, nullable=True)
    has_historical_memory = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="analysis")


class IncidentResolution(Base):
    __tablename__ = "incident_resolutions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(50), ForeignKey("incidents.id"), nullable=False, unique=True)
    root_cause = Column(Text, nullable=False)
    actions_taken = Column(Text, nullable=False)
    remediation = Column(Text, nullable=False)
    outcome = Column(Text, nullable=False)
    analyst_feedback = Column(Text, nullable=False)
    hindsight_memory_id = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="resolution")


class AgentExecution(Base):
    __tablename__ = "agent_executions"

    id = Column(String(50), primary_key=True)
    incident_id = Column(String(50), ForeignKey("incidents.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="RUNNING") # RUNNING, COMPLETED, FAILED
    steps_json = Column(Text, nullable=True) # JSON list of trace steps
    memory_queried = Column(Text, nullable=True)
    memory_found = Column(Boolean, default=False)
    memory_count = Column(Integer, default=0)
    memory_ids_json = Column(Text, nullable=True)
    reasoning_summary = Column(Text, nullable=True)
    errors_json = Column(Text, nullable=True)

    incident = relationship("Incident", back_populates="agent_executions")


class MemoryReference(Base):
    __tablename__ = "memory_references"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(50), ForeignKey("incidents.id"), nullable=False)
    recalled_incident_id = Column(String(50), nullable=True) # e.g. INC-1042
    memory_id = Column(String(100), nullable=False)
    recall_query = Column(Text, nullable=False)
    relevance_score = Column(Float, nullable=True)
    why_relevant = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    outcome = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="memory_references")
