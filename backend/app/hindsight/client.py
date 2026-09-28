import httpx
import logging
import time
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("memorysec.hindsight")

class HindsightClient:
    """
    Client for interacting with the Hindsight Agent Memory Service API.
    Reflects the official Hindsight API specification:
    - Base URL & Auth header
    - Bank Isolation via bank_id
    - Retain endpoint (/v1/banks/{bank_id}/retain or /v1/default/banks/{bank_id}/memories/retain)
    - Recall endpoint (/v1/banks/{bank_id}/recall or /v1/default/banks/{bank_id}/memories/recall)
    """

    def __init__(self, api_url: Optional[str] = None, api_key: Optional[str] = None):
        self.api_url = (api_url or settings.HINDSIGHT_API_URL or "").rstrip("/")
        self.api_key = api_key or settings.HINDSIGHT_API_KEY
        self.bank_id = settings.HINDSIGHT_BANK_ID or "memorysec-soc-bank"
        self.headers = {"Content-Type": "application/json"}
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"

    def is_configured(self) -> bool:
        return bool(self.api_url and self.api_url != "http://localhost:8888") or bool(self.api_key)

    async def check_health(self) -> Dict[str, Any]:
        """Verify Hindsight service connectivity."""
        if not self.is_configured():
            return {"status": "DEMO_MODE", "message": "Hindsight API running in local high-fidelity DEMO_MODE"}
        
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                url = f"{self.api_url}/health"
                resp = await client.get(url, headers=self.headers)
                if resp.status_code == 200:
                    return {"status": "CONNECTED", "details": resp.json()}
                return {"status": "DEGRADED", "status_code": resp.status_code}
        except Exception as e:
            logger.warning(f"Hindsight health check failed: {str(e)}")
            return {"status": "DEMO_MODE", "error": str(e), "message": "Falling back to local Hindsight engine"}

    async def retain(self, bank_id: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Retain a structured incident experience in a Hindsight memory bank.
        """
        if not self.is_configured():
            raise RuntimeError("Hindsight API client not configured for remote calls")

        payload = {
            "content": content,
            "metadata": metadata or {},
            "timestamp": time.time()
        }

        # Try official endpoints in sequence
        endpoints = [
            f"{self.api_url}/v1/banks/{bank_id}/retain",
            f"{self.api_url}/v1/default/banks/{bank_id}/memories/retain",
            f"{self.api_url}/api/v1/banks/{bank_id}/memories/retain"
        ]

        async with httpx.AsyncClient(timeout=5.0) as client:
            last_err = None
            for ep in endpoints:
                try:
                    resp = await client.post(ep, json=payload, headers=self.headers)
                    if resp.status_code in [200, 201]:
                        return resp.json()
                except Exception as e:
                    last_err = e
            raise RuntimeError(f"Failed to retain memory in Hindsight API: {last_err}")

    async def recall(self, bank_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Recall relevant historical memories from a Hindsight memory bank.
        """
        if not self.is_configured():
            raise RuntimeError("Hindsight API client not configured for remote calls")

        payload = {
            "query": query,
            "limit": limit
        }

        endpoints = [
            f"{self.api_url}/v1/banks/{bank_id}/recall",
            f"{self.api_url}/v1/default/banks/{bank_id}/memories/recall",
            f"{self.api_url}/api/v1/banks/{bank_id}/memories/recall"
        ]

        async with httpx.AsyncClient(timeout=5.0) as client:
            last_err = None
            for ep in endpoints:
                try:
                    resp = await client.post(ep, json=payload, headers=self.headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        if isinstance(data, list):
                            return data
                        return data.get("memories", data.get("results", []))
                except Exception as e:
                    last_err = e
            raise RuntimeError(f"Failed to recall memory from Hindsight API: {last_err}")
