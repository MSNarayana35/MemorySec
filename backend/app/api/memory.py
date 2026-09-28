from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.orm import Session
from app.services.database import get_db
from app.hindsight.memory_service import MemoryService
from app.schemas.schemas import HindsightMemoryItem
from app.models.models import IncidentResolution, Incident

router = APIRouter(prefix="/memory", tags=["Hindsight Memory"])

class MemoryRecallRequest(BaseModel):
    query: str = Field(..., example="Find previous incidents involving SSH failed logins and service account compromise")
    limit: int = Field(default=5, ge=1, le=20)

class MemoryRetainRequest(BaseModel):
    incident_id: str
    title: str
    incident_type: str
    severity: str
    pattern: str
    root_cause: str
    remediation: str
    outcome: str
    analyst_feedback: str

@router.post("/recall", response_model=List[HindsightMemoryItem])
async def recall_memory(payload: MemoryRecallRequest, db: Session = Depends(get_db)):
    """Search Hindsight memory bank for relevant security experiences."""
    service = MemoryService(db=db)
    memories = await service.recall_experiences(payload.query, limit=payload.limit)
    return memories

@router.post("/retain")
async def retain_memory(payload: MemoryRetainRequest, db: Session = Depends(get_db)):
    """Manually retain a security experience into Hindsight memory bank."""
    service = MemoryService(db=db)
    result = await service.retain_experience(
        incident_id=payload.incident_id,
        title=payload.title,
        incident_type=payload.incident_type,
        severity=payload.severity,
        pattern=payload.pattern,
        root_cause=payload.root_cause,
        remediation=payload.remediation,
        outcome=payload.outcome,
        analyst_feedback=payload.analyst_feedback
    )
    return result

@router.get("/recent", response_model=List[HindsightMemoryItem])
async def get_recent_memories(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """Get list of recently retained Hindsight organizational memories."""
    resolutions = (
        db.query(IncidentResolution)
        .order_by(IncidentResolution.created_at.desc())
        .limit(limit)
        .all()
    )
    
    items = []
    for res in resolutions:
        inc = db.query(Incident).filter(Incident.id == res.incident_id).first()
        if not inc:
            continue
        
        inc_type = inc.analysis.incident_type if inc.analysis else (inc.event_type or "Security Event")
        items.append(HindsightMemoryItem(
            memory_id=res.hindsight_memory_id or f"mem-{inc.id.lower()}",
            incident_id=inc.id,
            title=inc.title,
            incident_type=inc_type,
            severity=inc.severity,
            pattern=f"{inc.title}: {inc.description[:120]}...",
            root_cause=res.root_cause,
            remediation=res.remediation,
            outcome=res.outcome,
            analyst_feedback=res.analyst_feedback,
            why_relevant="Retained organizational security experience",
            relevance_score=1.0,
            timestamp=res.created_at.isoformat() if res.created_at else "",
            source="hindsight_live" if res.hindsight_memory_id else "hindsight_demo"
        ))
    return items
