import json
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.database import get_db
from app.models.models import Incident, IncidentAnalysis, IncidentResolution, MemoryReference
from app.services.ioc_extractor import extract_iocs_from_logs

router = APIRouter(prefix="/analytics", tags=["SOC Analytics & Reporting"])

MITRE_TACTIC_MAPPING = {
    "Initial Access": ["T1078 - Valid Accounts", "T1190 - Exploit Public-Facing Application", "T1566 - Phishing"],
    "Execution": ["T1059 - Command and Scripting Interpreter", "T1059.001 - PowerShell", "T1204 - User Execution"],
    "Privilege Escalation": ["T1068 - Exploitation for Privilege Escalation", "T1548 - Abuse Elevation Control Mechanism"],
    "Credential Access": ["T1110 - Brute Force", "T1003 - OS Credential Dumping", "T1555 - Credentials from Password Stores"],
    "Defense Evasion": ["T1070 - Indicator Removal", "T1027 - Obfuscated Files or Information"],
    "Lateral Movement": ["T1021 - Remote Services", "T1021.001 - Remote Desktop Protocol"],
    "Exfiltration": ["T1041 - Exfiltration Over C2 Channel", "T1567 - Exfiltration to Cloud Storage", "T1048 - Exfiltration Over Alternative Protocol"]
}

@router.get("/mitre-matrix")
async def get_mitre_matrix(db: Session = Depends(get_db)):
    """Retrieve MITRE ATT&CK Tactic & Technique coverage matrix based on investigated incidents."""
    incidents = db.query(Incident).all()
    detected_techniques = set()

    for inc in incidents:
        if inc.analysis and inc.analysis.attack_techniques_json:
            try:
                techs = json.loads(inc.analysis.attack_techniques_json)
                for t in techs:
                    detected_techniques.add(t)
            except Exception:
                pass

    matrix = []
    for tactic, techniques in MITRE_TACTIC_MAPPING.items():
        tactic_techs = []
        for tech in techniques:
            tech_code = tech.split(" - ")[0]
            is_detected = any(tech_code in dt for dt in detected_techniques)
            tactic_techs.append({
                "name": tech,
                "code": tech_code,
                "detected": is_detected
            })
        matrix.append({
            "tactic": tactic,
            "techniques": tactic_techs,
            "detected_count": sum(1 for t in tactic_techs if t["detected"])
        })

    return {
        "tactics": matrix,
        "total_detected_techniques": len(detected_techniques)
    }

@router.get("/ioc-threats")
async def get_ioc_threat_summary(db: Session = Depends(get_db)):
    """Retrieve aggregated Indicators of Compromise (IoCs) across all active and historical incidents."""
    incidents = db.query(Incident).all()
    all_ips = set()
    all_accounts = set()
    high_threat_count = 0

    for inc in incidents:
        if inc.source_ip:
            all_ips.add(inc.source_ip)
        if inc.affected_account:
            all_accounts.add(inc.affected_account)
        if inc.severity in ["CRITICAL", "HIGH"]:
            high_threat_count += 1

    return {
        "total_unique_ips": len(all_ips),
        "total_unique_accounts": len(all_accounts),
        "high_threat_incidents": high_threat_count,
        "monitored_accounts": list(all_accounts)[:10],
        "active_source_ips": list(all_ips)[:10]
    }

@router.get("/report/{incident_id}")
async def generate_executive_report(incident_id: str, db: Session = Depends(get_db)):
    """Generate an Executive Incident Briefing Markdown report for an incident."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    report_md = f"""# EXECUTIVE INCIDENT BRIEFING REPORT

**Incident ID:** `{inc.id}`  
**Title:** {inc.title}  
**Severity:** {inc.severity}  
**Status:** {inc.status}  
**Generated Date:** {inc.updated_at.strftime("%Y-%m-%d %H:%M:%S UTC")}  

---

## 1. Executive Summary
{inc.description}

### Affected Assets & Scope
- **Source IP:** `{inc.source_ip or 'N/A'}`
- **Destination IP:** `{inc.dest_ip or 'N/A'}`
- **Affected Account:** `{inc.affected_account or 'N/A'}`
- **Affected Service:** `{inc.affected_service or 'N/A'}`
- **Event Category:** `{inc.event_type or 'Security Event'}`

---

## 2. Hindsight Persistent Memory Integration
"""
    if inc.analysis and inc.analysis.has_historical_memory:
        mem_refs = db.query(MemoryReference).filter(MemoryReference.incident_id == incident_id).all()
        report_md += f"**Historical Memory Status:** RECALLED HISTORICAL EXPERIENCE\n\n"
        for ref in mem_refs:
            report_md += f"- **Recalled Incident:** `{ref.recalled_incident_id or 'HIST'}`\n"
            report_md += f"  - **Why Relevant:** {ref.why_relevant}\n"
            report_md += f"  - **Historical Root Cause:** {ref.root_cause}\n"
            report_md += f"  - **Historical Remediation:** {ref.remediation}\n\n"
    else:
        report_md += "**Historical Memory Status:** No prior historical experience matched in Hindsight Bank. Baseline baseline incident response executed.\n\n"

    if inc.resolution:
        report_md += f"""---

## 3. Incident Resolution & Post-Mortem
- **Confirmed Root Cause:** {inc.resolution.root_cause}
- **Actions Taken:** {inc.resolution.actions_taken}
- **Remediation Strategy:** {inc.resolution.remediation}
- **Final Outcome:** {inc.resolution.outcome}
- **Analyst Feedback:** *"{inc.resolution.analyst_feedback}"*
- **Hindsight Memory Retained ID:** `{inc.resolution.hindsight_memory_id or 'N/A'}`
"""

    return {
        "incident_id": inc.id,
        "title": inc.title,
        "report_markdown": report_md
    }
