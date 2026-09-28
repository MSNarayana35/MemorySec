import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Brain, History, Settings, PlusCircle, Activity, Cpu, Database, PlayCircle } from 'lucide-react';
import { SystemStatus } from '../types';

interface HeaderProps {
  systemStatus: SystemStatus | null;
}

export const Header: React.FC<HeaderProps> = ({ systemStatus }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Shield },
    { name: 'Investigate', path: '/new-incident', icon: PlusCircle },
    { name: 'Memory Explorer', path: '/memories', icon: Brain },
    { name: 'Incident History', path: '/history', icon: History },
    { name: 'Demo Mode', path: '/demo', icon: PlayCircle, highlight: true },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-white bg-clip-text text-transparent">
                  MEMORY<span className="text-cyan-400">SEC</span>
                </span>
                <span className="block text-[10px] font-mono tracking-wider text-slate-400 -mt-1">
                  AI INCIDENT RESPONSE AGENT
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    link.highlight
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400'
                      : active
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : ''}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* System Status Indicators */}
          <div className="flex items-center space-x-3">
            {/* Hindsight Status */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Hindsight:</span>
              <span className={`font-semibold ${
                systemStatus?.hindsight_status === 'CONNECTED' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {systemStatus?.hindsight_status || 'DEMO_MODE'}
              </span>
            </div>

            {/* LLM Status */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">LLM:</span>
              <span className="font-semibold text-slate-200">
                {systemStatus?.llm_status === 'GROQ_ONLINE' ? 'Groq Online' : 'Fallback Engine'}
              </span>
            </div>

            {/* Agent Live Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-medium">Agent Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
