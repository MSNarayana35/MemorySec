import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle2, Brain, PlusCircle, ArrowRight, Activity, Database, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

import { fetchIncidents, fetchRecentMemories, fetchSystemStatus } from '../services/api';
import { Incident, HindsightMemoryItem, SystemStatus } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { LearningLoopBanner } from '../components/LearningLoopBanner';
import { MitreMatrixWidget } from '../components/MitreMatrixWidget';
import { LiveTelemetryStreamer } from '../components/LiveTelemetryStreamer';

export const Dashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [memories, setMemories] = useState<HindsightMemoryItem[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [incList, memList, sysStatus] = await Promise.all([
          fetchIncidents(),
          fetchRecentMemories(5),
          fetchSystemStatus()
        ]);
        setIncidents(incList);
        setMemories(memList);
        setStatus(sysStatus);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCount = incidents.length;
  const openCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
  const highSevCount = incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
  const memoryAssistedCount = incidents.filter(i => i.analysis?.has_historical_memory || i.memory_references?.length).length;

  const severityData = [
    { name: 'Critical', count: incidents.filter(i => i.severity === 'CRITICAL').length, color: '#EF4444' },
    { name: 'High', count: incidents.filter(i => i.severity === 'HIGH').length, color: '#F97316' },
    { name: 'Medium', count: incidents.filter(i => i.severity === 'MEDIUM').length, color: '#F59E0B' },
    { name: 'Low', count: incidents.filter(i => i.severity === 'LOW').length, color: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            SOC SECURITY OPERATIONS DASHBOARD
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time incident response powered by Hindsight persistent memory reasoning engine
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/demo"
            className="px-3.5 py-2 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 text-xs font-semibold border border-cyan-500/30 transition-all flex items-center space-x-1.5"
          >
            <span>Run Demo Walkthrough</span>
          </Link>
          <Link
            to="/new-incident"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Investigate Incident</span>
          </Link>
        </div>
      </div>

      {/* Prominent Learning Loop Banner */}
      <LearningLoopBanner />

      {/* SOC Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Incidents</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalCount}</div>
          <div className="text-[10px] text-slate-500">Security telemetry logged</div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Investigations</span>
            <Activity className="w-4 h-4 text-amber-400 animate-pulse-subtle" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{openCount}</div>
          <div className="text-[10px] text-slate-500">Awaiting analyst action</div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Resolved & Retained</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{resolvedCount}</div>
          <div className="text-[10px] text-slate-500">Stored in Hindsight Bank</div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">High / Critical</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{highSevCount}</div>
          <div className="text-[10px] text-slate-500">Priority security threats</div>
        </div>

        {/* Metric 5: Memory Assisted */}
        <div className="glass-panel-accent rounded-xl p-4 border border-cyan-500/30 space-y-2 glow-cyan">
          <div className="flex items-center justify-between text-cyan-300">
            <span className="text-xs font-medium">Memory-Assisted</span>
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">{memoryAssistedCount}</div>
          <div className="text-[10px] text-cyan-400/80">Utilized Hindsight experience</div>
        </div>
      </div>

      {/* Live SOC Telemetry Streamer */}
      <LiveTelemetryStreamer />

      {/* MITRE ATT&CK Matrix Coverage */}
      <MitreMatrixWidget />

      {/* Main Grid: Recent Incidents vs Severity Chart & Recent Memories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Recent Incidents List */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                RECENT INCIDENTS
              </h2>
            </div>
            <Link to="/history" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {incidents.slice(0, 6).map((inc) => (
              <Link
                key={inc.id}
                to={`/incidents/${inc.id}`}
                className="block p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-cyan-400 group-hover:underline">
                      {inc.id}
                    </span>
                    <SeverityBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {inc.created_at ? new Date(inc.created_at).toLocaleDateString() : ''}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-slate-200 mt-2 group-hover:text-cyan-300">
                  {inc.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {inc.description}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <div className="flex items-center space-x-3">
                    {inc.affected_account && <span>Acc: <strong className="text-slate-400">{inc.affected_account}</strong></span>}
                    {inc.affected_service && <span>Svc: <strong className="text-slate-400">{inc.affected_service}</strong></span>}
                  </div>

                  {inc.analysis?.has_historical_memory && (
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <Brain className="w-3 h-3" /> Hindsight Memory Recalled
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3: Charts & Recent Memories Feed */}
        <div className="space-y-6">
          {/* Chart Card */}
          <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              INCIDENT SEVERITY DISTRIBUTION
            </h2>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Hindsight Memories */}
          <div className="glass-panel-accent rounded-xl p-5 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  RECENT HINDSIGHT MEMORIES
                </h2>
              </div>
              <Link to="/memories" className="text-[11px] text-cyan-400 hover:underline">
                Explorer
              </Link>
            </div>

            <div className="space-y-3">
              {memories.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No retained memories yet.</p>
              ) : (
                memories.map((mem, idx) => (
                  <div key={mem.memory_id || idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-cyan-400">{mem.incident_id || 'HIST'}</span>
                      <span className="text-[10px] font-mono text-emerald-400">Retained</span>
                    </div>
                    <p className="font-semibold text-slate-200 text-xs line-clamp-1">{mem.title}</p>
                    <p className="text-[11px] text-emerald-300 line-clamp-2">
                      <strong className="text-slate-400">Fix:</strong> {mem.remediation}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
