import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Filter, Shield, Brain, ArrowRight, Loader2 } from 'lucide-react';
import { fetchIncidents } from '../services/api';
import { Incident } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';

export const IncidentHistory: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchIncidents(statusFilter, severityFilter);
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incident history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter]);

  const filteredIncidents = incidents.filter(i => {
    const q = search.toLowerCase();
    return (
      i.id.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      (i.affected_account && i.affected_account.toLowerCase().includes(q)) ||
      (i.affected_service && i.affected_service.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-cyan-400" />
          INCIDENT HISTORY & AUDIT LOGS
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete operational audit log of all investigated incidents and memory references
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, account, or service..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Loading incidents...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No incidents matched your search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Incident ID</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Target Service</th>
                  <th className="px-4 py-3">Hindsight Memory</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-900/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                      {inc.id}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      {inc.title}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {inc.affected_service || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {inc.analysis?.has_historical_memory ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-800 inline-flex items-center gap-1">
                          <Brain className="w-3 h-3 text-emerald-400" /> RECALLED
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Baseline</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
