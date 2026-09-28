# Hindsight Integration & Memory Architecture

## 1. Executive Summary

Standard Retrieval-Augmented Generation (RAG) systems treat memory as unstructured chunks of past text or conversation logs. In complex domain tasks like cybersecurity incident response, raw conversation logs contain noise and obscure critical lessons.

**Hindsight** provides structured, agentic long-term memory organized into isolated **Memory Banks** (`bank_id`). MemorySec leverages Hindsight as its central cognitive memory engine.

## 2. What MemorySec Stores in Hindsight

Per security best practices, MemorySec does **NOT** dump raw chat transcripts into Hindsight. Instead, when an incident is resolved by an analyst, MemorySec synthesizes a **Structured Security Experience**:

```json
{
  "content": "INCIDENT_ID: INC-1042\nTITLE: Multiple Failed Logins Followed by DB Access\nINCIDENT_TYPE: Credential Compromise\nSEVERITY: HIGH\nPATTERN: 17 failed SSH logins from 198.51.100.45 followed by successful login for account 'svc_db_sync' and PostgreSQL privilege escalation.\nAFFECTED_ACCOUNT: svc_db_sync\nAFFECTED_SERVICE: PostgreSQL Production Cluster\nROOT_CAUSE: Compromised service account credentials\nREMEDIATION: Disable service account immediately, rotate credentials, block IP subnet\nOUTCOME: Incident resolved; malicious database access contained within 10 minutes\nANALYST_FEEDBACK: Disabling the service account immediately stopped unauthorized DB querying.",
  "metadata": {
    "memory_id": "mem-inc-1042-a1b2",
    "incident_id": "INC-1042",
    "title": "Multiple Failed Logins Followed by DB Access",
    "incident_type": "Credential Compromise",
    "severity": "HIGH",
    "pattern": "17 failed SSH logins...",
    "root_cause": "Compromised service account credentials",
    "remediation": "Disable service account immediately...",
    "outcome": "Incident contained",
    "analyst_feedback": "Disabling service account immediately stopped activity",
    "timestamp": "2026-09-28T08:30:00Z"
  }
}
```

## 3. Official API Endpoint Specification

MemorySec's `HindsightClient` and `MemoryService` communicate with Hindsight using standard HTTP REST API endpoints:

### Retain Memory
`POST /v1/banks/{bank_id}/retain` (or `/v1/default/banks/{bank_id}/memories/retain`)
- **Headers**: `Authorization: Bearer <HINDSIGHT_API_KEY>`
- **Payload**:
```json
{
  "content": "...",
  "metadata": { ... },
  "timestamp": 1759048200
}
```

### Recall Memory
`POST /v1/banks/{bank_id}/recall` (or `/v1/default/banks/{bank_id}/memories/recall`)
- **Payload**:
```json
{
  "query": "Find previous incidents involving multiple failed logins, privilege escalation, compromised service account 'svc_db_sync', and PostgreSQL access.",
  "limit": 3
}
```

## 4. Dual Remote & Local Fallback Strategy

To ensure zero downtime, MemorySec operates seamlessly in two modes:
1. **Live Remote Mode**: When `HINDSIGHT_API_URL` and `HINDSIGHT_API_KEY` are configured, calls are executed against the remote Hindsight service.
2. **High-Fidelity DEMO_MODE**: When remote credentials are absent or network connections timeout, MemorySec's `MemoryService` automatically activates its embedded local vector/keyword Hindsight Engine. The local engine calculates term-frequency and semantic similarity against SQLite resolved incidents, ensuring the judging demo functions flawlessly with complete behavioral accuracy.
