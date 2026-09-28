import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.services.database import init_db, SessionLocal
from app.api import incidents, memory, system, demo, analytics
from data.seed import seed_database

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("memorysec.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    logger.info("Initializing MemorySec database schema...")
    init_db()
    
    # Auto-seed sample incidents if database is empty
    db = SessionLocal()
    try:
        seeded_count = seed_database(db)
        if seeded_count > 0:
            logger.info(f"Seeded {seeded_count} synthetic security incidents into MemorySec database.")
    except Exception as e:
        logger.error(f"Error during database auto-seeding: {e}")
    finally:
        db.close()

    logger.info("MemorySec Backend API is ready.")
    yield
    logger.info("Shutting down MemorySec Backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI Incident Response Agent powered by Hindsight Persistent Memory",
    lifespan=lifespan
)

# Enable CORS for local Vite frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(memory.router, prefix=settings.API_V1_STR)
app.include_router(system.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "env": settings.APP_ENV
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
