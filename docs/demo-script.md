# MemorySec - 3-Minute Live Hackathon Demo Script

## Demo Overview
- **Product Name**: MemorySec - AI Incident Response Agent That Learns From Every Investigation
- **Target Audience**: Hackathon Judges, SOC Analysts, Cybersecurity Engineers
- **Demo Mode Page**: Navigate to `/demo` for 1-click execution or follow manual steps on `/new-incident`.

---

### [0:00 - 0:20] 1. The Problem
> **Presenter**: "Welcome! Modern Security Operations Centers (SOCs) process hundreds of alerts every day. Every time a new incident occurs, AI agents or human analysts often start from scratch—forgetting how past incidents were resolved. 
> 
> Generic AI chatbots give generic advice: 'Change the password and check logs.' But what if an AI SOC agent could **recall specific historical lessons** learned by analysts in previous incidents? 
> 
> That's **MemorySec**, powered by **Hindsight Agent Persistent Memory**."

---

### [0:20 - 0:45] 2. First Incident (INC-1042) - Baseline Investigation
> **Presenter**: "Let's look at our first incident, **INC-1042**.
> 
> A security alert fires: 17 failed SSH logins followed by successful authentication for service account `svc_db_sync` and PostgreSQL database privilege escalation.
> 
> When our AI agent investigates INC-1042 for the first time, it queries Hindsight. As expected, **no previous memory exists**. The agent generates a standard baseline recommendation: 'Verify user logs and consider password resets.'"

*(Action: Click "1. Load & Analyze INC-1042" on `/demo` or submit form)*

---

### [0:45 - 1:30] 3. Resolution & Retaining Experience in Hindsight
> **Presenter**: "Our security analyst investigates further and discovers that standard password resets didn't cut it—the service account API key was leaked.
> 
> The analyst resolves INC-1042 with key feedback: *'Disabling the service account immediately stopped unauthorized DB querying.'*
> 
> When we click **'Resolve & Learn in Hindsight'**, MemorySec synthesizes this structured experience—the pattern, root cause, remediation, and analyst feedback—and **retains it permanently in the Hindsight Memory Bank**."

*(Action: Click "2. Resolve INC-1042 & Store Experience in Hindsight")*

---

### [1:30 - 2:20] 4. Second Similar Incident (INC-1078) - Hindsight Recall & Learning Loop
> **Presenter**: "Now, a week later, a new incident fires: **INC-1078**. 
> 
> Notice: It comes from a **completely different IP address** (198.51.100.99), but shares the same behavioral pattern: 22 failed logins, successful auth for `svc_db_sync`, and immediate PostgreSQL superuser queries.
> 
> When MemorySec analyzes INC-1078, **Hindsight automatically recalls historical incident INC-1042**!
> 
> Look at the UI comparison:
> - **BEFORE MEMORY**: The generic agent recommended password resets and waiting.
> - **WITH HINDSIGHT MEMORY**: The agent recalls INC-1042, flags the confirmed root cause, and upgrades its recommendation to: **'HIGH PRIORITY: Immediately DISABLE service account `svc_db_sync` to break active session—do NOT delay while verifying logs.'**
> 
> The AI agent is now smarter because of Hindsight!"

*(Action: Click "3. Load & Analyze INC-1078" on `/demo` and highlight the Visual Comparison)*

---

### [2:20 - 2:45] 5. Architecture & Memory Explorer
> **Presenter**: "Let's check the **Memory Explorer**. Here we can inspect all retained organizational memories stored in Hindsight Bank `memorysec-soc-bank`. 
> 
> MemorySec built on FastAPI, React, Groq LLM reasoning, and official Hindsight API integration. If external services temporarily disconnect, MemorySec gracefully operates in local high-fidelity DEMO MODE."

*(Action: Click "Memory Explorer" and "Settings" tabs)*

---

### [2:45 - 3:00] 6. Conclusion
> **Presenter**: "MemorySec proves that persistent memory transforms AI agents from generic chatbots into context-aware security teammates that get stronger with every investigation. 
> 
> Thank you!"
