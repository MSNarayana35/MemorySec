import re
from typing import Dict, List, Any

# Safe documentation IP subnets (RFC 5737 & RFC 1918)
DOC_IP_REGEX = r'\b(?:198\.51\.100\.\d{1,3}|192\.0\.2\.\d{1,3}|203\.0\.113\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b'
GENERIC_IP_REGEX = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
MITRE_TECHNIQUE_REGEX = r'T\d{4}(?:\.\d{3})?'
USER_ACCOUNT_REGEX = r'\b(?:svc_[a-zA-Z0-9_-]+|user_[a-zA-Z0-9_-]+|admin[a-zA-Z0-9_-]*|root|postgres|system)\b'

def extract_iocs_from_logs(raw_logs: str) -> Dict[str, Any]:
    """
    Extract structured Indicators of Compromise (IoCs) and threat indicators from security logs.
    """
    if not raw_logs:
        return {"ips": [], "accounts": [], "mitre_techniques": [], "risk_score": 30}

    ips = list(set(re.findall(GENERIC_IP_REGEX, raw_logs)))
    doc_ips = list(set(re.findall(DOC_IP_REGEX, raw_logs)))
    accounts = list(set(re.findall(USER_ACCOUNT_REGEX, raw_logs, re.IGNORECASE)))
    mitre_techs = list(set(re.findall(MITRE_TECHNIQUE_REGEX, raw_logs)))

    # Calculate threat risk score (0-100)
    risk_score = 40
    if len(ips) > 1:
        risk_score += 15
    if any(a.lower() in ["root", "admin", "postgres", "svc_db_sync"] for a in accounts):
        risk_score += 25
    if "failed" in raw_logs.lower() or "error" in raw_logs.lower():
        risk_score += 15
    if "accepted" in raw_logs.lower() or "sudo" in raw_logs.lower():
        risk_score += 10

    risk_score = min(98, max(25, risk_score))

    formatted_ips = []
    for ip in ips:
        is_safe_doc = ip in doc_ips or ip.startswith("192.0.2.") or ip.startswith("198.51.100.") or ip.startswith("203.0.113.")
        formatted_ips.append({
            "ip": ip,
            "type": "Documentation / Example Range" if is_safe_doc else "External IPv4",
            "risk_level": "HIGH" if not is_safe_doc else "MEDIUM"
        })

    return {
        "ips": formatted_ips,
        "accounts": accounts,
        "mitre_techniques": mitre_techs,
        "risk_score": risk_score,
        "is_high_risk": risk_score >= 75
    }
