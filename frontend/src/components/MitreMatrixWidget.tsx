import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Technique {
  name: string;
  code: string;
  detected: boolean;
}

interface Tactic {
  tactic: string;
  techniques: Technique[];
  detected_count: number;
}

export const MitreMatrixWidget: React.FC = () => {
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [totalDetected, setTotalDetected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatrix() {
      try {
        const res = await fetch('/api/analytics/mitre-matrix');
        if (res.ok) {
          const data = await res.json();
          setTactics(data.tactics || []);
          setTotalDetected(data.total_detected_techniques || 0);
        }
      } catch (err) {
        console.error('Failed to fetch MITRE matrix:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatrix();
  }, []);

  if (loading) return null;

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            MITRE ATT&CK® TACTIC & TECHNIQUE COVERAGE MATRIX
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
          {totalDetected} Active Techniques Detected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tactics.slice(0, 4).map((t, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">{t.tactic}</span>
              <span className="text-[10px] font-mono text-cyan-400">{t.detected_count} Match</span>
            </div>

            <div className="space-y-1.5">
              {t.techniques.map((tech, tidx) => (
                <div
                  key={tidx}
                  className={`p-2 rounded text-[10px] font-mono flex items-center justify-between border ${
                    tech.detected
                      ? 'bg-indigo-950/80 text-indigo-200 border-indigo-700/80 font-bold'
                      : 'bg-slate-900/50 text-slate-500 border-slate-850'
                  }`}
                >
                  <span className="truncate max-w-[170px]">{tech.name}</span>
                  {tech.detected ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="text-[9px] text-slate-600">Idle</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
