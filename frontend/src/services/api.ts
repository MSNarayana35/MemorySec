import {
  Incident,
  IncidentResolution,
  StructuredIncidentAnalysis,
  HindsightMemoryItem,
  AgentExecutionTrace,
  SystemStatus
} from '../types';

const API_BASE = '/api';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/system/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchIncidents(status?: string, severity?: string): Promise<Incident[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (severity) params.append('severity', severity);
  
  const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch incident ${id}`);
  return res.json();
}

export async function createIncident(data: Partial<Incident>): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to submit incident');
  return res.json();
}

export async function analyzeIncident(id: string): Promise<StructuredIncidentAnalysis> {
  const res = await fetch(`${API_BASE}/incidents/${id}/analyze`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run incident analysis');
  return res.json();
}

export async function resolveIncident(
  id: string,
  payload: {
    root_cause: string;
    actions_taken: string;
    remediation: string;
    outcome: string;
    analyst_feedback: string;
  }
): Promise<{ status: string; hindsight_memory_id?: string; message: string }> {
  const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to resolve incident');
  return res.json();
}

export async function fetchAgentExecutionTrace(id: string): Promise<AgentExecutionTrace> {
  const res = await fetch(`${API_BASE}/incidents/${id}/agent-execution`);
  if (!res.ok) throw new Error('Failed to fetch agent trace');
  return res.json();
}

export async function fetchRecentMemories(limit = 10): Promise<HindsightMemoryItem[]> {
  const res = await fetch(`${API_BASE}/memory/recent?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch Hindsight memories');
  return res.json();
}

export async function recallMemories(query: string, limit = 5): Promise<HindsightMemoryItem[]> {
  const res = await fetch(`${API_BASE}/memory/recall`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit })
  });
  if (!res.ok) throw new Error('Failed to recall memory from Hindsight');
  return res.json();
}

export async function fetchDemoScenario(name: string): Promise<Partial<Incident>> {
  const res = await fetch(`${API_BASE}/demo/scenario/${name}`);
  if (!res.ok) throw new Error(`Failed to fetch scenario ${name}`);
  return res.json();
}

export async function triggerDemoSeed(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/demo/seed`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to seed demo database');
  return res.json();
}
