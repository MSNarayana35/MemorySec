import React from 'react';
import { ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { StructuredIncidentAnalysis } from '../types';

interface Props {
  analysis: StructuredIncidentAnalysis;
}

export const VisualComparison: React.FC<Props> = ({ analysis }) => {
  if (!analysis.has_historical_memory || analysis.recalled_memories.length === 0) {
    return null;
  }

  const recalledMem = analysis.recalled_memories[0];

  return (
    <div className="glass-panel rounded-xl p-5 border border-cyan-500/30 my-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          BEFORE vs AFTER HINDSIGHT MEMORY COMPARISON
        </h3>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
          LEARNING LOOP EFFECT VERIFIED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WITHOUT MEMORY */}
        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-4 space-y-3 opacity-75">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              WITHOUT HISTORICAL MEMORY
            </span>
            <span className="text-[10px] font-mono text-slate-500">Generic Response</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">Baseline Assessment:</span>
              <p className="text-slate-400">Generic brute-force / password spraying investigation protocol.</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Generic Actions:</span>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                <li>Verify login logs with user</li>
                <li>Consider password reset</li>
                <li>Standard firewall IP check</li>
              </ul>
            </div>
            <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-900">
              Risk: Generic password resets leave compromised service account keys active in environment.
            </div>
          </div>
        </div>

        {/* WITH HINDSIGHT MEMORY */}
        <div className="rounded-lg bg-slate-900/90 border border-cyan-500/40 p-4 space-y-3 glow-cyan relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              WITH HINDSIGHT MEMORY ({recalledMem.incident_id || 'INC-1042'})
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Context-Aware Response
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-cyan-400 font-semibold block">Recalled Root Cause:</span>
              <p className="text-slate-200 font-medium">{recalledMem.root_cause}</p>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold block">Upgraded Remediation Plan:</span>
              <ul className="list-disc list-inside text-slate-200 space-y-1 font-medium pl-1">
                <li><strong className="text-rose-300">Disable account immediately</strong> (Do not delay)</li>
                <li>Rotate database secret tokens across services</li>
                <li>Block source IP and audit exfiltration queries</li>
              </ul>
            </div>
            <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800/60 flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Learned from Analyst in {recalledMem.incident_id || 'INC-1042'}: "{recalledMem.analyst_feedback}"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
