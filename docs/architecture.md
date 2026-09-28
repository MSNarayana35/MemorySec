# MemorySec - System Architecture

MemorySec is an AI Incident Response platform that utilizes **Hindsight Persistent Agent Memory** to learn from every security investigation.

## 1. High-Level Architecture

```mermaid
flowchart TD
    Analyst["Security Analyst / SOC User"] -->|Submits Incident / Logs| Frontend["React + TypeScript Frontend (Vite + Tailwind)"]
    Frontend -->|REST API / JSON| FastAPI["FastAPI Backend Orchestrator"]
    
    subgraph Agent Core
        FastAPI --> Agent["Incident Response Agent"]
        Agent -->|1. Parse & Extract IoCs| Extractor["Indicator Extractor"]
        Agent -->|2. Recall Memory| HindsightSvc["Hindsight Memory Service"]
        Agent -->|3. Memory-Aware Reasoning| LLM["LLM Client (Groq API / Fallback)"]
    end
    
    HindsightSvc -->|SDK / REST API| HindsightBank[("Hindsight Memory Bank (bank_id)")]
    FastAPI -->|Store Metadata & Audit| SQLite[("SQLite / PostgreSQL Database")]
    
    Agent -->|4. Generate Response Plan| Frontend
    Analyst -->|5. Provide Feedback & Resolve| FastAPI
    FastAPI -->|6. Retain Experience| HindsightSvc
```

## 2. Component Breakdown

### Frontend (`frontend/`)
- **Technology**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Pages**:
  - `Dashboard`: High-level SOC telemetry, severity distribution chart, recent incidents, recent memories.
  - `NewIncident`: Form submission + 1-click Quick Demo Presets.
  - `IncidentInvestigation`: IoCs, 🧠 Hindsight Memory Panel, Agent Execution Trace, Visual Comparison (`WITHOUT MEMORY` vs `WITH MEMORY`), and Resolve Modal.
  - `MemoryExplorer`: Filterable organizational knowledge base of retained Hindsight experiences.
  - `IncidentHistory`: Searchable audit log of all incidents.
  - `Settings`: Live system connection diagnostics & database re-seeding controls.
  - `DemoScenarioPage`: 1-Click interactive judging demo walkthrough.

### Backend (`backend/`)
- **Technology**: Python 3.13, FastAPI, Pydantic V2, SQLAlchemy, Uvicorn, Pytest.
- **Modules**:
  - `app.api`: REST routers (`/incidents`, `/memory`, `/system`, `/demo`).
  - `app.agents.orchestrator`: Multi-step incident response agent orchestration pipeline.
  - `app.hindsight`: Dedicated Hindsight Memory Service with dual remote API client and local high-fidelity recall engine fallback.
  - `app.llm`: Groq LLM integration (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile`) with structured JSON Pydantic output validation.
  - `app.models`: SQLAlchemy database schemas for Incidents, Events, Analysis, Resolutions, Agent Executions, and Memory References.

## 3. The Memory Learning Loop

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Security Analyst
    participant App as MemorySec App
    participant Hindsight as Hindsight Memory Bank
    participant LLM as Groq LLM Engine

    Analyst->>App: 1. Submit Incident (e.g. INC-1042)
    App->>Hindsight: 2. Recall Memory for incident pattern
    Hindsight-->>App: 3. Return recalled experiences (0 initially)
    App->>LLM: 4. Perform baseline reasoning
    LLM-->>App: 5. Return structured investigation plan
    Analyst->>App: 6. Resolve incident & input root cause + remediation
    App->>Hindsight: 7. Retain structured experience in bank

    note over Analyst, Hindsight: Later: Similar Incident occurs (e.g. INC-1078)

    Analyst->>App: 8. Submit Similar Incident (INC-1078)
    App->>Hindsight: 9. Recall Memory for incident pattern
    Hindsight-->>App: 10. Recalls INC-1042 experience!
    App->>LLM: 11. Memory-aware reasoning (Current + Recalled INC-1042)
    LLM-->>App: 12. Return Context-Aware Upgraded Recommendation
```
