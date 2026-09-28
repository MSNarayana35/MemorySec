import React from 'react';
import { Search, Cpu, MessageSquareCode, CheckCircle2, Database } from 'lucide-react';

interface Props {
  activeStep?: number; // 1 to 5
}

export const LearningLoopBanner: React.FC<Props> = ({ activeStep }) => {
  const steps = [
    { num: 1, label: 'RECALL', desc: 'Query Hindsight Memory Bank', icon: Search, color: 'text-cyan-400' },
    { num: 2, label: 'ANALYZE', desc: 'Memory-Aware LLM Reasoning', icon: Cpu, color: 'text-indigo-400' },
    { num: 3, label: 'RESPOND', desc: 'Context-Aware Action Plan', icon: MessageSquareCode, color: 'text-purple-400' },
    { num: 4, label: 'RESOLVE', desc: 'Analyst Feedback & Outcome', icon: CheckCircle2, color: 'text-amber-400' },
    { num: 5, label: 'RETAIN', desc: 'Experience Stored in Hindsight', icon: Database, color: 'text-emerald-400' },
  ];

  return (
    <div className="w-full glass-panel-accent rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60">
            <Database className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              Memory Learning Loop
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                HINDSIGHT CENTRAL ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Every investigation enriches organizational memory for future incidents
            </p>
          </div>
        </div>

        {/* Pipeline Nodes */}
        <div className="w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-3 min-w-max">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = activeStep === s.num;
              const isPast = activeStep ? activeStep > s.num : false;

              return (
                <React.Fragment key={s.num}>
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-105'
                      : isPast
                      ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                    <span className="text-xs font-mono font-bold">{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <span className="text-slate-600 font-bold text-xs">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
