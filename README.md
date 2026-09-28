# MEMORYSEC
### AI Incident Response Agent That Learns From Every Investigation

MemorySec is a production-style cybersecurity incident response platform powered by an AI agent layer and **Hindsight Persistent Agent Memory**. 

Instead of acting as a static chatbot or isolated investigation tool, MemorySec retains organizational security experiences in **Hindsight Memory Banks**. When a new incident occurs, the agent recalls past root causes, remediations, and analyst feedback—producing context-aware, highly targeted recommendations.

---

## 1. Problem & Solution

### The Problem
Traditional SOC incident response tools and generic LLM chatbots suffer from **AI Amnesia**. Every new alert is investigated as if it were the first time the organization has ever seen it. Generic LLMs offer baseline advice (e.g. *"Reset password and check logs"*), ignoring hard-won lessons from past investigations.

### The Solution
MemorySec implements the **Hindsight Memory Learning Loop**:

```
RECALL → ANALYZE → RESPOND → RESOLVE → RETAIN
```

1. **Incident Ingestion**: Analyst submits a security incident or pastes raw logs.
2. **Hindsight Memory Recall**: The AI agent queries Hindsight using the behavioral attack pattern.
3. **Memory-Aware Reasoning**: The agent combines current evidence with recalled historical experiences.
4. **Analyst Resolution**: The security analyst resolves the incident and provides root cause & remediation feedback.
5. **Hindsight Retention**: MemorySec stores the incident experience in Hindsight.
6. **Continuous Learning**: Subsequent similar incidents automatically benefit from recalled memory!

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Python 3.13, FastAPI, Pydantic V2, SQLAlchemy, Uvicorn, Pytest.
- **Memory**: Hindsight Agent Memory API & SDK (`HindsightClient`, `MemoryService`).
- **AI / LLM**: Groq API (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile`) with structured JSON Pydantic parsing and security fallback heuristics.
- **Database**: SQLite (SQLAlchemy ORM configured for PostgreSQL compatibility).
- **Deployment**: Docker Compose, Uvicorn, Vite.

---

## 3. Project Structure

```
memorysec/
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, MemoryPanel, VisualComparison, AgentTracePanel, ResolveModal
│   │   ├── pages/            # Dashboard, NewIncident, IncidentInvestigation, MemoryExplorer, History, Settings, DemoScenarioPage
│   │   ├── services/         # API REST client
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/              # REST Endpoints (incidents, memory, system, demo)
│   │   ├── agents/           # IncidentResponseAgent Orchestrator
│   │   ├── hindsight/        # Hindsight API Client & Memory Service
│   │   ├── llm/              # Groq LLM Client & Fallback Engine
│   │   ├── models/           # SQLAlchemy Models
│   │   ├── schemas/          # Pydantic Schemas
│   │   ├── services/         # Database initialization & sessions
│   │   ├── core/             # Configuration & settings
│   │   └── main.py           # FastAPI entrypoint
│   ├── tests/                # Pytest unit & integration tests
│   └── requirements.txt
│
├── data/
│   ├── seed.py               # Database seeder with 10 synthetic incidents
│   └── memorysec.db          # SQLite Database
│
├── docs/
│   ├── architecture.md       # Architecture & Mermaid diagrams
│   ├── hindsight.md          # Hindsight integration specs & REST payloads
│   ├── demo-script.md        # 3-Minute presentation script for judges
│   └── content-notes.md      # Article & social media notes
│
├── docker-compose.yml
├── README.md
├── .env.example
└── .gitignore
```

---

## 4. Environment Variables

Create `.env` in the root directory (copied from `.env.example`):

```bash
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

HINDSIGHT_API_URL=http://localhost:8888
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BANK_ID=memorysec-soc-bank

DATABASE_URL=sqlite:///./memorysec.db
APP_ENV=development
```

---

## 5. Running Locally

### Backend Setup (FastAPI)
```bash
# Navigate to project root
cd MemorySec

# Create virtual environment and install requirements
uv venv backend/.venv
uv pip install -r backend/requirements.txt --python backend/.venv

# Run Pytest test suite
backend/.venv/Scripts/python.exe -m pytest backend/tests/ -v

# Start FastAPI server
backend/.venv/Scripts/python.exe -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup (Vite + React)
```bash
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 6. Primary Demo Scenario Guide

Navigate to `/demo` or follow these steps:

### Phase 1: First Incident (INC-1042)
1. Go to **New Incident** and click **🚀 Load Incident #1 (INC-1042)**.
2. Submit the incident.
3. Observe **Hindsight Memory Panel**: *"No relevant historical experience found in Hindsight."*
4. Agent generates a baseline generic recommendation.
5. Click **Resolve & Learn in Hindsight**. Fill out:
   - **Root Cause**: `Compromised service account credentials (svc_db_sync)`
   - **Remediation**: `Disable service account immediately, rotate credentials, block IP`
   - **Feedback**: `Disabling service account immediately stopped unauthorized DB querying.`
6. Confirm: **✓ Experience retained in Hindsight Bank**.

### Phase 2: Second Similar Incident (INC-1078)
1. Go to **New Incident** and click **🚀 Load Incident #2 (INC-1078)**.
2. Notice: Different source IP (`198.51.100.99`), but same account `svc_db_sync` & PostgreSQL target.
3. Submit and launch investigation.
4. **Hindsight Memory Recalled**: Hindsight automatically retrieves **INC-1042**!
5. Observe **Visual Comparison Card** (`WITHOUT MEMORY` vs `WITH HINDSIGHT MEMORY`).
6. Agent upgrades recommendation: **"HIGH PRIORITY: Immediately DISABLE service account `svc_db_sync`—do NOT delay."**

---

## 7. Security Considerations

- **Safe Data**: All IP addresses use standard documentation/example ranges (`198.51.100.0/24`, `192.0.2.0/24`, `203.0.113.0/24`). No real malicious infrastructure or active payloads are used.
- **Credential Protection**: API keys are managed strictly via `.env` environment variables and never logged or exposed to the client.
- **Analysis Only**: MemorySec is an incident response assistant and defensive investigation platform.
