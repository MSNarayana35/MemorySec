import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Play, ShieldAlert, Sparkles, Terminal, FileText, Loader2 } from 'lucide-react';
import { createIncident, fetchDemoScenario } from '../services/api';
import { Severity } from '../types';

export const NewIncident: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [sourceIp, setSourceIp] = useState('');
  const [destIp, setDestIp] = useState('');
  const [affectedAccount, setAffectedAccount] = useState('');
  const [affectedService, setAffectedService] = useState('');
  const [eventType, setEventType] = useState('Credential Compromise');
  const [rawLogs, setRawLogs] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  const [loading, setLoading] = useState(false);
  const [presetLoading, setPresetLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadPreset = async (name: string) => {
    setPresetLoading(name);
    setError('');
    try {
      const data = await fetchDemoScenario(name);
      setTitle(data.title || '');
      setDescription(data.description || '');
      setSeverity((data.severity as Severity) || 'HIGH');
      setSourceIp(data.source_ip || '');
      setDestIp(data.dest_ip || '');
      setAffectedAccount(data.affected_account || '');
      setAffectedService(data.affected_service || '');
      setEventType(data.event_type || 'Credential Compromise');
      setRawLogs(data.raw_logs || '');
      setAdditionalContext(data.additional_context || '');
    } catch (err: any) {
      setError(`Failed to load preset ${name}: ${err.message}`);
    } finally {
      setPresetLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and Description are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const incident = await createIncident({
        title,
        description,
        severity,
        source_ip: sourceIp || '198.51.100.45',
        dest_ip: destIp || '192.0.2.10',
        affected_account: affectedAccount || 'svc_db_sync',
        affected_service: affectedService || 'PostgreSQL Prod',
        event_type: eventType,
        raw_logs: rawLogs,
        additional_context: additionalContext,
      });

      // Redirect immediately to investigation view
      navigate(`/incidents/${incident.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit incident');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-cyan-400" />
          SUBMIT NEW INCIDENT FOR INVESTIGATION
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          MemorySec AI agent will extract IoCs, query Hindsight for historical memory, and formulate a context-aware response.
        </p>
      </div>

      {/* Demo Preset Buttons Section */}
      <div className="glass-panel-accent rounded-xl p-5 border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            QUICK DEMO PRESET LOADER
          </span>
          <span className="text-[10px] font-mono text-cyan-300">1-CLICK DEMO INCIDENTS</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => loadPreset('inc-1042')}
            disabled={!!presetLoading}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-600/60 text-cyan-300 text-xs font-semibold hover:bg-cyan-900 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            {presetLoading === 'inc-1042' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>🚀 Load Incident #1 (INC-1042)</span>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('inc-1078')}
            disabled={!!presetLoading}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/80 border border-indigo-600/60 text-indigo-300 text-xs font-semibold hover:bg-indigo-900 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            {presetLoading === 'inc-1078' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>🚀 Load Incident #2 (INC-1078)</span>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('credential-compromise')}
            disabled={!!presetLoading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-all"
          >
            OAuth Token Abuse
          </button>

          <button
            type="button"
            onClick={() => loadPreset('privilege-escalation')}
            disabled={!!presetLoading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-all"
          >
            PowerShell Script Block
          </button>

          <button
            type="button"
            onClick={() => loadPreset('suspicious-login')}
            disabled={!!presetLoading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-all"
          >
            Impossible Travel
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-panel rounded-xl p-6 border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Title & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Multiple Failed Logins Followed by DB Access"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Incident Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the security anomaly, observed behavior, and impacted scope..."
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* IP & Account Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Source IP</label>
              <input
                type="text"
                value={sourceIp}
                onChange={(e) => setSourceIp(e.target.value)}
                placeholder="198.51.100.45"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination IP</label>
              <input
                type="text"
                value={destIp}
                onChange={(e) => setDestIp(e.target.value)}
                placeholder="192.0.2.10"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Account</label>
              <input
                type="text"
                value={affectedAccount}
                onChange={(e) => setAffectedAccount(e.target.value)}
                placeholder="svc_db_sync"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Affected Service</label>
              <input
                type="text"
                value={affectedService}
                onChange={(e) => setAffectedService(e.target.value)}
                placeholder="PostgreSQL Prod"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Raw Logs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Raw Security Logs
              </span>
              <span className="text-[10px] text-slate-500">Paste raw auth/sshd/firewall log lines</span>
            </label>
            <textarea
              rows={4}
              value={rawLogs}
              onChange={(e) => setRawLogs(e.target.value)}
              placeholder="Paste raw log lines here..."
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting & Launching Agent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch AI Investigation & Hindsight Recall</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
