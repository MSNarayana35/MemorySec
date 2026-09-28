import React, { useState } from 'react';
import { X, CheckCircle2, Database, Sparkles, Loader2 } from 'lucide-react';
import { resolveIncident } from '../services/api';

interface Props {
  incidentId: string;
  incidentTitle: string;
  defaultRootCause?: string;
  defaultRemediation?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResolveModal: React.FC<Props> = ({
  incidentId,
  incidentTitle,
  defaultRootCause = '',
  defaultRemediation = '',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rootCause, setRootCause] = useState(
    defaultRootCause || 'Compromised service account credentials (svc_db_sync)'
  );
  const [actionsTaken, setActionsTaken] = useState(
    'Disabled service account, rotated API tokens, blocked IP address'
  );
  const [remediation, setRemediation] = useState(
    defaultRemediation || 'Disable service account immediately, rotate credentials, enforce IP subnet restriction'
  );
  const [outcome, setOutcome] = useState('Incident contained; unauthorized database queries stopped');
  const [analystFeedback, setAnalystFeedback] = useState(
    'Disabling the service account immediately halted malicious DB querying activity.'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<{ hindsight_memory_id?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await resolveIncident(incidentId, {
        root_cause: rootCause,
        actions_taken: actionsTaken,
        remediation: remediation,
        outcome: outcome,
        analyst_feedback: analystFeedback,
      });

      setSuccessResult(res);
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel-accent rounded-xl w-full max-w-2xl overflow-hidden border border-cyan-500/40 glow-cyan relative shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                RESOLVE INCIDENT & RETAIN IN HINDSIGHT
              </h3>
              <p className="text-xs text-slate-400">
                Incident: <span className="font-mono text-cyan-400">{incidentId}</span> - {incidentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {successResult ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto glow-emerald">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-100">✓ Incident Resolved</h4>
            <div className="p-4 rounded-lg bg-slate-900 border border-cyan-500/30 max-w-md mx-auto text-left text-xs space-y-2 font-mono">
              <p className="text-emerald-400 font-bold">✓ Experience stored in Hindsight Memory Bank</p>
              <p className="text-cyan-300">Memory ID: {successResult.hindsight_memory_id || 'mem-inc-retained'}</p>
              <p className="text-slate-400">Future investigations will now automatically recall this experience!</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded bg-rose-950/80 border border-rose-800 text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Confirmed Root Cause <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Compromised service account credentials"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Actions Taken <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Successful Remediation Strategy <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={remediation}
                  onChange={(e) => setRemediation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Final Outcome <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Analyst Feedback / Key Lesson <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={analystFeedback}
                  onChange={(e) => setAnalystFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                This experience will be retained in Hindsight Bank
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Retaining in Hindsight...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Resolve & Retain Experience</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
