import React from 'react';
import { IncidentStatus } from '../types';

interface Props {
  status: IncidentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const st = (status || 'OPEN').toUpperCase();
  
  let styles = 'bg-blue-950/60 text-blue-300 border-blue-800/60';
  if (st === 'RESOLVED') {
    styles = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
  } else if (st === 'INVESTIGATING') {
    styles = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60 animate-pulse-subtle';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}>
      {st}
    </span>
  );
};
