import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Brain, Cpu, Database, RefreshCw, CheckCircle2, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { fetchSystemStatus, triggerDemoSeed } from '../services/api';
import { SystemStatus } from '../types';

export const Settings: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load system status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setMessage('');
    try {
      const res = await triggerDemoSeed();
      setMessage(res.message);
      await loadStatus();
    } catch (err: any) {
      setMessage(`Error seeding database: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            SYSTEM DIAGNOSTICS & HINDSIGHT CONFIGURATION
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor API connectivity, Hindsight Memory Bank status, LLM models, and local database storage
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs">
          {message}
        </div>
      )}

      {/* Connection Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hindsight Status */}
        <div className="glass-panel-accent rounded-xl p-5 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase">Hindsight Memory Bank</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              {status?.hindsight_status || 'DEMO_MODE'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 font-mono">
            <div><span className="text-slate-500">Bank ID:</span> {status?.hindsight_bank_id || 'memorysec-soc-bank'}</div>
            <div><span className="text-slate-500">Memories Stored:</span> {status?.total_memories || 0}</div>
            <div>
              <span className="text-slate-500">Mode:</span>{' '}
              {status?.hindsight_status === 'CONNECTED' ? 'Live API' : 'High-Fidelity DEMO_MODE'}
            </div>
          </div>
        </div>

        {/* LLM Status */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase">LLM Provider</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
              {status?.llm_status || 'FALLBACK_MODE'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 font-mono">
            <div><span className="text-slate-500">Target Model:</span> {status?.llm_model || 'openai/gpt-oss-120b'}</div>
            <div>
              <span className="text-slate-500">Status:</span>{' '}
              {status?.llm_status === 'GROQ_ONLINE' ? 'Groq Connected' : 'Structured Fallback Engine'}
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase">Local Database</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              HEALTHY
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 font-mono">
            <div><span className="text-slate-500">Engine:</span> SQLite / SQLAlchemy</div>
            <div><span className="text-slate-500">Incidents Logged:</span> {status?.total_incidents || 0}</div>
            <div><span className="text-slate-500">Resolved:</span> {status?.resolved_incidents || 0}</div>
          </div>
        </div>
      </div>

      {/* Database Reset & Seed Action */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          DATABASE MANAGEMENT & SEED DATA
        </h3>
        <p className="text-xs text-slate-400">
          Re-seed the database with initial synthetic historical security incidents to reset demo baseline.
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Re-Seed Synthetic Incidents</span>
        </button>
      </div>

      {/* Environment Variables Reference */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          ENVIRONMENT VARIABLE CONFIGURATION (.env)
        </h3>
        <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
{`GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

HINDSIGHT_API_URL=http://localhost:8888
HINDSIGHT_API_KEY=your_hindsight_key_here
HINDSIGHT_BANK_ID=memorysec-soc-bank

DATABASE_URL=sqlite:///./memorysec.db
APP_ENV=development`}
        </pre>
      </div>
    </div>
  );
};
