import React from 'react';
import { Brain, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { HindsightMemoryItem } from '../types';

interface Props {
  memories: HindsightMemoryItem[];
  query?: string;
  hasMemory: boolean;
}

export const MemoryPanel: React.FC<Props> = ({ memories, query, hasMemory }) => {
  return (
    <div className={`rounded-xl border p-5 transition-all ${
      hasMemory
        ? 'glass-panel-accent border-cyan-500/40 glow-cyan'
        : 'glass-panel border-slate-800'
    }`}>
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-lg ${hasMemory ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400'}`}>
            <Brain className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-100 uppercase flex items-center gap-2">
              🧠 HINDSIGHT MEMORY
              {hasMemory ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> RECALLED
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  NO PREVIOUS MEMORY
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {hasMemory
                ? 'Historical security experience recalled from Hindsight memory bank'
                : 'No historical pattern matching this incident was found in Hindsight'}
            </p>
          </div>
        </div>

        {query && (
          <div className="hidden sm:block text-right">
            <span className="text-[10px] font-mono text-slate-500 block">RECALL QUERY</span>
            <span className="text-xs font-mono text-cyan-300/90 truncate max-w-[200px] block">
              "{query}"
            </span>
          </div>
        )}
      </div>

      {/* Memory Content Body */}
      {!hasMemory || memories.length === 0 ? (
        <div className="py-6 text-center rounded-lg bg-slate-900/50 border border-dashed border-slate-800">
          <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-300">No relevant historical experience found in Hindsight.</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
            This investigation is running baseline heuristics. Once resolved, the root cause and remediation will be stored in Hindsight for future incidents.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((mem, idx) => (
            <div
              key={mem.memory_id || idx}
              className="rounded-lg bg-slate-900/90 border border-cyan-500/30 p-4 space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-800">
                    {mem.incident_id || 'RECALLED_EXPERIENCE'}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{mem.title}</span>
                </div>
                {mem.relevance_score && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Relevance: {Math.round(mem.relevance_score * 100)}%
                  </span>
                )}
              </div>

              {/* Why Relevant */}
              <div className="text-xs bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="font-semibold text-cyan-400">Why Relevant: </span>
                <span className="text-slate-300">{mem.why_relevant}</span>
              </div>

              {/* Root Cause & Remediation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800">
                  <span className="font-semibold text-rose-400 block mb-1">Previous Root Cause:</span>
                  <p className="text-slate-300">{mem.root_cause}</p>
                </div>
                <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800">
                  <span className="font-semibold text-emerald-400 block mb-1">Previous Successful Remediation:</span>
                  <p className="text-slate-300">{mem.remediation}</p>
                </div>
              </div>

              {/* Outcome & Feedback */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 text-[11px] text-slate-400 gap-2 border-t border-slate-800/60">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Outcome: {mem.outcome}</span>
                </div>
                <div className="text-slate-300 italic">
                  "{mem.analyst_feedback}"
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
