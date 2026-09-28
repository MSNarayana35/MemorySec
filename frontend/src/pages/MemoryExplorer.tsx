import React, { useEffect, useState } from 'react';
import { Brain, Search, Filter, Database, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { fetchRecentMemories, recallMemories } from '../services/api';
import { HindsightMemoryItem } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

export const MemoryExplorer: React.FC = () => {
  const [memories, setMemories] = useState<HindsightMemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const data = await fetchRecentMemories(20);
      setMemories(data);
    } catch (err) {
      console.error('Failed to fetch Hindsight memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadMemories();
      return;
    }

    setSearching(true);
    try {
      const results = await recallMemories(searchQuery, 10);
      setMemories(results);
    } catch (err) {
      console.error('Memory search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            HINDSIGHT MEMORY EXPLORER
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and search learned organizational security experiences stored in Hindsight Memory Bank
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono">
            Bank: memorysec-soc-bank
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory bank by behavior, account (e.g. svc_db_sync), technique, or root cause..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={searching}
          className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Query Memory Bank</span>
        </button>
      </form>

      {/* Memories Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          <span>Retrieving memories from Hindsight...</span>
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center text-slate-400 text-xs border border-slate-800 space-y-2">
          <Database className="w-8 h-8 text-slate-500 mx-auto" />
          <p>No historical memories match your query in Hindsight Bank.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem, idx) => (
            <div
              key={mem.memory_id || idx}
              className="glass-panel rounded-xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-800">
                    {mem.incident_id || 'RECALLED_MEM'}
                  </span>
                  <SeverityBadge severity={mem.severity} />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {mem.source === 'hindsight_live' ? 'Hindsight Live' : 'Hindsight Engine'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300">
                {mem.title}
              </h3>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                  <span className="font-semibold text-rose-400 block mb-0.5">Root Cause:</span>
                  <p className="text-slate-300">{mem.root_cause}</p>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                  <span className="font-semibold text-emerald-400 block mb-0.5">Remediation Strategy:</span>
                  <p className="text-slate-300">{mem.remediation}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-slate-300 italic">"{mem.analyst_feedback}"</span>
                <span className="font-mono text-slate-500">
                  {mem.timestamp ? new Date(mem.timestamp).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
