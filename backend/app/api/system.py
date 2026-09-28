from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services.database import get_db
from app.models.models import Incident, IncidentResolution, MemoryReference
from app.schemas.schemas import SystemStatusResponse
from app.hindsight.memory_service import MemoryService
from app.llm.client import LLMClient
from app.core.config import settings

router = APIRouter(prefix="/system", tags=["System & Status"])

@router.get("/status", response_model=SystemStatusResponse)
async def get_system_status(db: Session = Depends(get_db)):
    """Get status of AI Agent, Hindsight Memory Bank, LLM, and Database."""
    memory_service = MemoryService(db=db)
    hindsight_info = await memory_service.get_status()
    llm_client = LLMClient()
    
    total_incidents = db.query(Incident).count()
    resolved_incidents = db.query(Incident).filter(Incident.status == "RESOLVED").count()
    total_memories = db.query(IncidentResolution).filter(IncidentResolution.hindsight_memory_id.isnot(None)).count()
    
    h_status = hindsight_info.get("status", "DEMO_MODE")
    llm_status = "GROQ_ONLINE" if llm_client.is_available() else "FALLBACK_MODE"

    return SystemStatusResponse(
        agent_status="ONLINE",
        hindsight_status=h_status,
        hindsight_bank_id=settings.HINDSIGHT_BANK_ID,
        llm_status=llm_status,
        llm_model=settings.GROQ_MODEL,
        database_status="HEALTHY",
        total_incidents=total_incidents,
        resolved_incidents=resolved_incidents,
        total_memories=total_memories,
        app_env=settings.APP_ENV
    )
