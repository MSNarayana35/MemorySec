import React from 'react';
import { Severity } from '../types';

interface Props {
  severity: Severity | string;
  className?: string;
}

export const SeverityBadge: React.FC<Props> = ({ severity, className = '' }) => {
  const sev = (severity || 'MEDIUM').toUpperCase();
  
  let styles = 'bg-slate-800 text-slate-300 border-slate-700';
  if (sev === 'CRITICAL') {
    styles = 'bg-rose-950/80 text-rose-300 border-rose-800/60 animate-pulse-subtle';
  } else if (sev === 'HIGH') {
    styles = 'bg-amber-950/80 text-amber-300 border-amber-800/60';
  } else if (sev === 'MEDIUM') {
    styles = 'bg-yellow-950/60 text-yellow-300 border-yellow-800/50';
  } else if (sev === 'LOW') {
    styles = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {sev}
    </span>
  );
};
