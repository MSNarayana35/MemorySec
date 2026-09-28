import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Cpu, ChevronRight } from 'lucide-react';
import { AgentExecutionTrace, AgentTraceStep } from '../types';

interface Props {
  trace: AgentExecutionTrace | null;
  loading?: boolean;
}

export const AgentTracePanel: React.FC<Props> = ({ trace, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-slate-800 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-slate-900 rounded" />
          <div className="h-8 bg-slate-900 rounded" />
          <div className="h-8 bg-slate-900 rounded" />
        </div>
      </div>
    );
  }

  if (!trace || trace.steps.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-5 border border-slate-800 text-center py-6 text-slate-400 text-xs">
        No agent execution trace logged yet. Run investigation to see live trace steps.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            AGENT EXECUTION TRACE
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
          STATUS: {trace.status}
        </span>
      </div>

      <div className="space-y-2.5">
        {trace.steps.map((step) => {
          const isDone = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';
          const isFailed = step.status === 'failed';

          return (
            <div
              key={step.step_number}
              className={`p-3 rounded-lg border text-xs transition-all flex items-start space-x-3 ${
                isDone
                  ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                  : isInProgress
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200 animate-pulse-subtle'
                  : 'bg-slate-950/30 border-slate-900 text-slate-400'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isInProgress ? (
                  <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : isFailed ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    Step {step.step_number}: {step.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>

                {step.details && (
                  <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-cyan-300 overflow-x-auto">
                    {Object.entries(step.details).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-400">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
