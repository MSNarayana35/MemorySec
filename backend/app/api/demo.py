from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.database import get_db
from app.models.models import Incident, IncidentEvent, IncidentAnalysis, IncidentResolution, MemoryReference
import datetime

router = APIRouter(prefix="/demo", tags=["Demo Scenarios & Seed"])

DEMO_SCENARIOS = {
    "inc-1042": {
        "id": "INC-1042",
        "title": "Multiple Failed Logins Followed by DB Access (Incident #1)",
        "description": "System logged 17 consecutive SSH authentication failures from IP 198.51.100.45 followed by a successful authentication for service account 'svc_db_sync'. Immediately following login, uncharacteristic PostgreSQL administrative query commands were executed.",
        "severity": "HIGH",
        "source_ip": "198.51.100.45",
        "dest_ip": "192.0.2.10",
        "affected_account": "svc_db_sync",
        "affected_service": "PostgreSQL Production Cluster",
        "event_type": "Credential Compromise",
        "raw_logs": """2026-09-28 08:14:02 sshd[4412]: Failed password for invalid user admin from 198.51.100.45 port 51022 ssh2
2026-09-28 08:14:05 sshd[4415]: Failed password for invalid user root from 198.51.100.45 port 51024 ssh2
2026-09-28 08:14:09 sshd[4418]: Failed password for user svc_db_sync from 198.51.100.45 port 51028 ssh2
... [14 identical failed password attempts omitted] ...
2026-09-28 08:15:11 sshd[4490]: Accepted password for svc_db_sync from 198.51.100.45 port 51099 ssh2
2026-09-28 08:15:14 sudo: svc_db_sync : TTY=pts/1 ; PWD=/home/svc_db_sync ; USER=postgres ; COMMAND=/usr/bin/psql -U postgres -c SELECT pg_read_file('/etc/shadow');""",
        "additional_context": "Service account svc_db_sync is normally restricted to automated batch jobs executed from internal subnet 192.0.2.0/24."
    },
    "inc-1078": {
        "id": "INC-1078",
        "title": "Suspicious Service Account Logins & Privilege Escalation (Incident #2)",
        "description": "Security telemetry triggered high-severity alert for service account 'svc_db_sync'. 22 failed SSH login attempts recorded from external IP 198.51.100.99 prior to successful authentication and immediate PostgreSQL superuser access attempt.",
        "severity": "CRITICAL",
        "source_ip": "198.51.100.99",
        "dest_ip": "192.0.2.12",
        "affected_account": "svc_db_sync",
        "affected_service": "PostgreSQL Analytics Cluster",
        "event_type": "Credential Compromise",
        "raw_logs": """2026-09-28 14:02:11 sshd[8812]: Failed password for user svc_db_sync from 198.51.100.99 port 61200 ssh2
2026-09-28 14:02:15 sshd[8819]: Failed password for user svc_db_sync from 198.51.100.99 port 61205 ssh2
... [20 failed password attempts from 198.51.100.99] ...
2026-09-28 14:03:40 sshd[8901]: Accepted password for svc_db_sync from 198.51.100.99 port 61250 ssh2
2026-09-28 14:03:44 sudo: svc_db_sync : TTY=pts/2 ; PWD=/home/svc_db_sync ; USER=postgres ; COMMAND=/usr/bin/psql -c \\du""",
        "additional_context": "Note similarity to previous incidents involving svc_db_sync account."
    },
    "credential-compromise": {
        "id": "DEMO-CRED-01",
        "title": "OAuth Token Abuse & API Impersonation",
        "description": "Anomalous bearer token usage detected for user dev_lead@company.com accessing customer telemetry APIs from an unapproved IP range in Europe.",
        "severity": "HIGH",
        "source_ip": "203.0.113.88",
        "dest_ip": "192.0.2.50",
        "affected_account": "dev_lead@company.com",
        "affected_service": "Customer Telemetry API Gateway",
        "event_type": "Credential Compromise",
        "raw_logs": """2026-09-28 09:10:00 API_GW [WARN] Token exchange mismatch for sub:dev_lead@company.com from 203.0.113.88
2026-09-28 09:10:02 API_GW [INFO] GET /v1/customers/export - 200 OK (Content-Length: 45MB)""",
        "additional_context": "User device posturing check failed prior to API access."
    },
    "privilege-escalation": {
        "id": "DEMO-PRIV-01",
        "title": "Suspicious PowerShell Script Block Execution",
        "description": "Endpoint Detection & Response agent flagged encoded PowerShell command line creating scheduled task under SYSTEM context on web server WEB-04.",
        "severity": "CRITICAL",
        "source_ip": "192.0.2.14",
        "dest_ip": "192.0.2.14",
        "affected_account": "IIS APPPOOL\\DefaultAppPool",
        "affected_service": "Web Application Host WEB-04",
        "event_type": "Privilege Escalation",
        "raw_logs": """2026-09-28 11:20:00 EDR_Agent [CRITICAL] Process powershell.exe spawned by w3wp.exe with args: -enc SUVYKE5ldy1PYmplY3QgTmV0LldlYkNsaWVudCk...
2026-09-28 11:20:02 Security-Auditing 4698: A scheduled task was created. Task Name: UpdateChecker""",
        "additional_context": "Web application pool process should not spawn powershell.exe."
    },
    "suspicious-login": {
        "id": "DEMO-AUTH-01",
        "title": "Impossible Travel Authentication Alert",
        "description": "Okta Single Sign-On detected simultaneous active sessions for user j.smith from San Francisco, USA and Tokyo, Japan within 10 minutes.",
        "severity": "MEDIUM",
        "source_ip": "198.51.100.201",
        "dest_ip": "192.0.2.100",
        "affected_account": "j.smith@company.com",
        "affected_service": "Okta Identity Provider",
        "event_type": "Suspicious Authentication",
        "raw_logs": """2026-09-28 07:30:00 OKTA [INFO] Successful MFA login for j.smith@company.com (IP: 198.51.100.10, Location: San Francisco, US)
2026-09-28 07:38:12 OKTA [WARN] Successful MFA login for j.smith@company.com (IP: 198.51.100.201, Location: Tokyo, JP)""",
        "additional_context": "User reported no travel plans. Suspected session cookie theft."
    }
}

@router.get("/scenario/{scenario_name}")
async def get_demo_scenario(scenario_name: str, db: Session = Depends(get_db)):
    """Retrieve pre-configured demo scenario incident data."""
    name = scenario_name.lower().strip()
    if name not in DEMO_SCENARIOS:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario '{scenario_name}' not found. Available: {list(DEMO_SCENARIOS.keys())}"
        )
    return DEMO_SCENARIOS[name]

@router.post("/seed")
async def seed_demo_data(db: Session = Depends(get_db)):
    """Seed SQLite database with 10 synthetic historical security incidents."""
    from data.seed import seed_database
    count = seed_database(db)
    return {"status": "SUCCESS", "message": f"Successfully seeded {count} incidents into MemorySec database."}
