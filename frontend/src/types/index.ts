export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export interface IncidentEvent {
  id: number;
  timestamp?: string;
  log_level: string;
  message: string;
  source?: string;
}

export interface HindsightMemoryItem {
  memory_id: string;
  incident_id?: string;
  title: string;
  incident_type: string;
  severity: string;
  pattern: string;
  root_cause: string;
  remediation: string;
  outcome: string;
  analyst_feedback: string;
  why_relevant: string;
  relevance_score?: number;
  timestamp: string;
  source: 'hindsight_live' | 'hindsight_demo';
}

export interface StructuredIncidentAnalysis {
  severity: Severity;
  incident_type: string;
  confidence: number;
  summary: string;
  indicators: string[];
  attack_techniques: string[];
  possible_root_causes: string[];
  recommended_actions: string[];
  evidence: string[];
  memory_query: string;
  has_historical_memory: boolean;
  recalled_memories: HindsightMemoryItem[];
  historical_context_summary?: string;
  similarities?: string[];
  differences?: string[];
  reasoning?: string;
  warnings?: string[];
}

export interface IncidentAnalysisRead extends StructuredIncidentAnalysis {
  id: number;
  incident_id: string;
  created_at: string;
}

export interface IncidentResolution {
  id?: number;
  incident_id: string;
  root_cause: string;
  actions_taken: string;
  remediation: string;
  outcome: string;
  analyst_feedback: string;
  hindsight_memory_id?: string;
  created_at?: string;
}

export interface MemoryReference {
  id: number;
  incident_id: string;
  recalled_incident_id?: string;
  memory_id: string;
  recall_query: string;
  relevance_score?: number;
  why_relevant: string;
  root_cause?: string;
  remediation?: string;
  outcome?: string;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  source_ip?: string;
  dest_ip?: string;
  affected_account?: string;
  affected_service?: string;
  event_type?: string;
  raw_logs?: string;
  additional_context?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
  events?: IncidentEvent[];
  analysis?: IncidentAnalysisRead;
  resolution?: IncidentResolution;
  memory_references?: MemoryReference[];
}

export interface AgentTraceStep {
  step_number: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  timestamp: string;
  details?: Record<string, any>;
}

export interface AgentExecutionTrace {
  id: string;
  incident_id: string;
  started_at: string;
  completed_at?: string;
  status: string;
  steps: AgentTraceStep[];
  memory_queried?: string;
  memory_found: boolean;
  memory_count: number;
  reasoning_summary?: string;
  errors: string[];
}

export interface SystemStatus {
  agent_status: string;
  hindsight_status: string;
  hindsight_bank_id: string;
  llm_status: string;
  llm_model: string;
  database_status: string;
  total_incidents: number;
  resolved_incidents: number;
  total_memories: number;
  app_env: string;
}
