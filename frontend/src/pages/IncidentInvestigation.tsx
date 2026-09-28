import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Brain, Cpu, CheckCircle2, Sparkles, Terminal, FileText, ArrowLeft, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

import { fetchIncidentById, analyzeIncident, fetchAgentExecutionTrace } from '../services/api';
import { Incident, StructuredIncidentAnalysis, AgentExecutionTrace } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { MemoryPanel } from '../components/MemoryPanel';
import { AgentTracePanel } from '../components/AgentTracePanel';
import { VisualComparison } from '../components/VisualComparison';
import { ResolveModal } from '../components/ResolveModal';
import { LearningLoopBanner } from '../components/LearningLoopBanner';

export const IncidentInvestigation: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [analysis, setAnalysis] = useState<StructuredIncidentAnalysis | null>(null);
  const [trace, setTrace] = useState<AgentExecutionTrace | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isResolveOpen, setIsResolveOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const inc = await fetchIncidentById(id);
      setIncident(inc);

      if (inc.analysis) {
        setAnalysis(inc.analysis);
      }

      // Fetch trace if available
      try {
        const tr = await fetchAgentExecutionTrace(id);
        setTrace(tr);
      } catch {
        // Trace might not exist yet
      }

      // If incident has not been analyzed yet, auto-trigger agent investigation!
      if (!inc.analysis) {
        runAnalysis(id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (incId: string) => {
    setAnalyzing(true);
    try {
      const result = await analyzeIncident(incId);
      setAnalysis(result);

      // Refresh incident & trace
      const updatedInc = await fetchIncidentById(incId);
      setIncident(updatedInc);

      try {
        const tr = await fetchAgentExecutionTrace(incId);
        setTrace(tr);
      } catch {
        // ignore
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading incident data and initializing Hindsight memory engine...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 border border-rose-800">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100">Incident Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Incident details could not be retrieved.'}</p>
        <Link to="/" className="inline-block px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-200">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <Link to="/" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-sm font-bold text-cyan-400">{incident.id}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-1">{incident.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => runAnalysis(incident.id)}
            disabled={analyzing}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Re-Run Investigation</span>
          </button>

          {incident.status !== 'RESOLVED' && (
            <button
              onClick={() => setIsResolveOpen(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolve & Learn in Hindsight</span>
            </button>
          )}
        </div>
      </div>

      {/* Learning Loop Banner with active step */}
      <LearningLoopBanner activeStep={incident.status === 'RESOLVED' ? 5 : analysis?.has_historical_memory ? 3 : 2} />

      {/* Incident Metadata & Indicators Grid */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          EXTRACTED INDICATORS & METADATA
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Source IP</span>
            <span className="font-mono text-cyan-400 font-semibold">{incident.source_ip || 'N/A'}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Destination IP</span>
            <span className="font-mono text-cyan-400 font-semibold">{incident.dest_ip || 'N/A'}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Affected Account</span>
            <span className="font-mono text-amber-300 font-semibold">{incident.affected_account || 'N/A'}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Affected Service</span>
            <span className="text-slate-200 font-semibold">{incident.affected_service || 'N/A'}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Event Type</span>
            <span className="text-indigo-300 font-semibold">{incident.event_type || 'N/A'}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Timestamp</span>
            <span className="font-mono text-slate-300">{new Date(incident.created_at).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* 🧠 HINDSIGHT MEMORY PANEL */}
      <MemoryPanel
        memories={analysis?.recalled_memories || []}
        query={analysis?.memory_query}
        hasMemory={!!analysis?.has_historical_memory}
      />

      {/* VISUAL DIFFERENCE COMPARISON (Appears when memory is recalled) */}
      {analysis && <VisualComparison analysis={analysis} />}

      {/* Agent Activity Trace */}
      <AgentTracePanel trace={trace} loading={analyzing} />

      {/* Analysis Findings & Recommendations */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analysis Summary & Attack Techniques */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              AI AGENT FINDINGS & SUMMARY
            </h3>

            <div className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded border border-slate-800 leading-relaxed">
              {analysis.summary}
            </div>

            {/* MITRE ATT&CK Techniques */}
            {analysis.attack_techniques.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">MITRE ATT&CK TECHNIQUES</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.attack_techniques.map((tech, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[11px]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence & Root Causes */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">POSSIBLE ROOT CAUSES</span>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {analysis.possible_root_causes.map((rc, idx) => (
                  <li key={idx}>{rc}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Response Plan */}
          <div className="glass-panel-accent rounded-xl p-5 border border-cyan-500/30 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-cyan-500/30 pb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              RECOMMENDED RESPONSE PLAN {analysis.has_historical_memory && '(HINDSIGHT ENHANCED)'}
            </h3>

            <div className="space-y-2">
              {analysis.recommended_actions.map((act, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center flex-shrink-0 text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>

            {/* Agent Reasoning */}
            {analysis.reasoning && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
                <strong className="text-cyan-400 not-italic">Agent Reasoning: </strong>
                "{analysis.reasoning}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Security Logs Section */}
      {incident.raw_logs && (
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            RAW INGESTED SECURITY LOGS
          </h3>
          <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap">
            {incident.raw_logs}
          </pre>
        </div>
      )}

      {/* Resolve Incident Modal */}
      <ResolveModal
        incidentId={incident.id}
        incidentTitle={incident.title}
        defaultRootCause={analysis?.possible_root_causes[0]}
        defaultRemediation={analysis?.recommended_actions[0]}
        isOpen={isResolveOpen}
        onClose={() => setIsResolveOpen(false)}
        onSuccess={() => {
          setIsResolveOpen(false);
          loadData();
        }}
      />
    </div>
  );
};
