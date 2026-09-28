import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import models & database base
import app.services.database as db_module
from app.models.models import Base

# Create in-memory SQLite database with StaticPool for thread-safe test isolation
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Override engine and get_db in database module
db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

from app.main import app
app.dependency_overrides[db_module.get_db] = override_get_db

# Create all tables on test_engine
Base.metadata.create_all(bind=test_engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert "agent_status" in data
    assert "hindsight_status" in data

def test_create_and_analyze_incident():
    # 1. Create Incident
    payload = {
        "title": "Test Failed Logins on PostgreSQL",
        "description": "17 SSH failed attempts followed by DB escalation",
        "severity": "HIGH",
        "source_ip": "198.51.100.45",
        "dest_ip": "192.0.2.10",
        "affected_account": "svc_db_sync",
        "affected_service": "PostgreSQL Prod",
        "event_type": "Credential Compromise",
        "raw_logs": "Failed password for svc_db_sync\nAccepted password for svc_db_sync"
    }
    create_res = client.post("/api/incidents", json=payload)
    assert create_res.status_code == 201
    inc_data = create_res.json()
    inc_id = inc_data["id"]

    # 2. Analyze Incident
    analyze_res = client.post(f"/api/incidents/{inc_id}/analyze")
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    assert analysis["severity"] == "HIGH"
    assert "indicators" in analysis
    assert "recommended_actions" in analysis

    # 3. Resolve Incident & Retain Memory
    resolve_payload = {
        "root_cause": "Compromised service account key",
        "actions_taken": "Disabled account and rotated credentials",
        "remediation": "Disable account immediately and block IP",
        "outcome": "Incident contained",
        "analyst_feedback": "Disabling account worked immediately"
    }
    resolve_res = client.post(f"/api/incidents/{inc_id}/resolve", json=resolve_payload)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "SUCCESS"
    assert "hindsight_memory_id" in resolve_res.json()
