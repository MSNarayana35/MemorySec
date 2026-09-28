import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Terminal, PlusCircle, Sparkles } from 'lucide-react';
import { createIncident } from '../services/api';

interface LogLine {
  id: string;
  time: string;
  source: string;
  level: 'CRITICAL' | 'WARN' | 'INFO';
  msg: string;
  account: string;
  ip: string;
}

const SAMPLE_TELEMETRY: LogLine[] = [
  { id: 'log-1', time: '11:20:04', source: 'sshd[5102]', level: 'WARN', msg: 'Failed password for invalid user admin from 198.51.100.45 port 51022', account: 'admin', ip: '198.51.100.45' },
  { id: 'log-2', time: '11:20:08', source: 'K8sAudit', level: 'CRITICAL', msg: 'Anonymous serviceaccount default bound cluster-admin role in namespace payments', account: 'default', ip: '198.51.100.90' },
  { id: 'log-3', time: '11:20:12', source: 'CloudTrail', level: 'WARN', msg: 'GetObject bulk query on s3://financial-audit-logs by key infra-backup-temp', account: 'infra-backup-temp', ip: '198.51.100.12' },
  { id: 'log-4', time: '11:20:15', source: 'CoreDNS', level: 'CRITICAL', msg: 'High-entropy TXT query data-drop.attacker-dns.org containing base64 payload', account: 'system_dns_resolver', ip: '192.0.2.180' },
  { id: 'log-5', time: '11:20:19', source: 'Okta_SSO', level: 'WARN', msg: 'Impossible travel alert: Simultaneous logins from US and JP for j.smith@company.com', account: 'j.smith@company.com', ip: '198.51.100.201' },
];

export const LiveTelemetryStreamer: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogLine[]>(SAMPLE_TELEMETRY.slice(0, 3));
  const [ingestingId, setIngestingId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextLog = SAMPLE_TELEMETRY[Math.floor(Math.random() * SAMPLE_TELEMETRY.length)];
      const updatedLog = {
        ...nextLog,
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString()
      };
      setLogs(prev => [updatedLog, ...prev.slice(0, 3)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleIngest = async (log: LogLine) => {
    setIngestingId(log.id);
    try {
      const inc = await createIncident({
        title: `Real-Time Security Event: ${log.source} - ${log.msg.slice(0, 45)}...`,
        description: log.msg,
        severity: log.level === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        source_ip: log.ip,
        affected_account: log.account,
        affected_service: log.source,
        event_type: 'Live Security Alert',
        raw_logs: `${log.time} ${log.source} [${log.level}]: ${log.msg}`
      });
      navigate(`/incidents/${inc.id}`);
    } catch (err) {
      console.error('Failed to ingest log:', err);
    } finally {
      setIngestingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            LIVE SOC TELEMETRY STREAM
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
          STREAM ACTIVE (4000ms)
        </span>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono space-x-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <span className="text-slate-500 text-[10px]">{log.time}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                log.level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {log.level}
              </span>
              <span className="text-slate-300 truncate max-w-xl">{log.msg}</span>
            </div>

            <button
              onClick={() => handleIngest(log)}
              disabled={ingestingId === log.id}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-[10px] font-semibold flex items-center space-x-1 flex-shrink-0 transition-all"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Investigate</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
