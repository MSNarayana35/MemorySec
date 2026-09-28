import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Brain, CheckCircle2, ArrowRight, Sparkles, ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';
import { fetchDemoScenario, createIncident, analyzeIncident, resolveIncident } from '../services/api';
import { StructuredIncidentAnalysis } from '../types';
import { MemoryPanel } from '../components/MemoryPanel';
import { VisualComparison } from '../components/VisualComparison';
import { SeverityBadge } from '../components/SeverityBadge';
import { LearningLoopBanner } from '../components/LearningLoopBanner';

export const DemoScenarioPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [inc1042Id, setInc1042Id] = useState<string>('INC-1042');
  const [inc1078Id, setInc1078Id] = useState<string>('INC-1078');

  const [analysisPhase1, setAnalysisPhase1] = useState<StructuredIncidentAnalysis | null>(null);
  const [analysisPhase2, setAnalysisPhase2] = useState<StructuredIncidentAnalysis | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 1-Click Execution for Phase 1
  const runPhase1 = async () => {
    setLoading(true);
    setStatusMessage('Loading & Analyzing First Incident INC-1042...');
    try {
      // Create or ensure INC-1042
      const scenario = await fetchDemoScenario('inc-1042');
      const inc = await createIncident(scenario);
      setInc1042Id(inc.id);

      // Analyze (Will find NO prior memory for this pattern)
      const res = await analyzeIncident(inc.id);
      setAnalysisPhase1(res);
      setActiveStep(2);
      setStatusMessage('✓ Phase 1 Incident INC-1042 Analyzed: No previous memory found in Hindsight.');
    } catch (err: any) {
      setStatusMessage(`Error in Phase 1: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resolvePhase1 = async () => {
    setLoading(true);
    setStatusMessage('Resolving INC-1042 and retaining experience in Hindsight...');
    try {
      await resolveIncident(inc1042Id, {
        root_cause: 'Compromised service account credentials (svc_db_sync)',
        actions_taken: 'Disabled service account immediately, rotated API secrets, blocked source IP',
        remediation: 'Disable service account immediately, rotate credentials, enforce IP subnet restriction',
        outcome: 'Incident resolved; malicious database access contained within 10 minutes',
        analyst_feedback: 'Disabling service account immediately halted unauthorized DB querying.'
      });

      setActiveStep(3);
      setStatusMessage('✓ INC-1042 Experience successfully stored in Hindsight Memory Bank!');
    } catch (err: any) {
      setStatusMessage(`Error resolving: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Execution for Phase 2
  const runPhase2 = async () => {
    setLoading(true);
    setStatusMessage('Loading & Analyzing Second Similar Incident INC-1078...');
    try {
      const scenario = await fetchDemoScenario('inc-1078');
      const inc = await createIncident(scenario);
      setInc1078Id(inc.id);

      // Analyze (Will recall INC-1042!)
      const res = await analyzeIncident(inc.id);
      setAnalysisPhase2(res);
      setActiveStep(4);
      setStatusMessage('✓ HINDSIGHT RECALL TRIGGERED! INC-1042 experience recalled to upgrade response.');
    } catch (err: any) {
      setStatusMessage(`Error in Phase 2: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-cyan-400" />
            CRITICAL HINDSIGHT LEARNING LOOP DEMO
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Demonstrates how MemorySec AI Agent learns from Incident #1 and upgrades its recommendation for Incident #2
          </p>
        </div>

        <button
          onClick={() => {
            setActiveStep(1);
            setAnalysisPhase1(null);
            setAnalysisPhase2(null);
            setStatusMessage('Demo reset.');
          }}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Flow</span>
        </button>
      </div>

      <LearningLoopBanner activeStep={activeStep === 1 ? 1 : activeStep === 2 ? 2 : activeStep === 3 ? 4 : 5} />

      {/* Status Bar */}
      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-md">
          {statusMessage}
        </div>
      )}

      {/* STEP 1: Phase 1 (INC-1042) */}
      <div className={`glass-panel rounded-xl p-5 border transition-all ${activeStep === 1 || activeStep === 2 ? 'border-cyan-500/50 glow-cyan' : 'border-slate-800'}`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <span className="w-7 h-7 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs font-mono">
              1
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-100">PHASE 1: FIRST INCIDENT (INC-1042)</h2>
              <p className="text-xs text-slate-400">17 failed SSH logins, privilege escalation, database access from IP 198.51.100.45</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!analysisPhase1 ? (
              <button
                onClick={runPhase1}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>1. Load & Analyze INC-1042</span>
              </button>
            ) : (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
                ✓ Analyzed (No Memory)
              </span>
            )}
          </div>
        </div>

        {/* Phase 1 Analysis Results */}
        {analysisPhase1 && (
          <div className="space-y-4">
            <MemoryPanel
              memories={analysisPhase1.recalled_memories}
              query={analysisPhase1.memory_query}
              hasMemory={analysisPhase1.has_historical_memory}
            />

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block">Baseline Agent Recommendation:</span>
              <p className="text-slate-300">{analysisPhase1.summary}</p>
            </div>

            {activeStep === 2 && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={resolvePhase1}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>2. Resolve INC-1042 & Store Experience in Hindsight</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STEP 2: Phase 2 (INC-1078) */}
      <div className={`glass-panel rounded-xl p-5 border transition-all ${activeStep >= 3 ? 'border-cyan-500/50 glow-cyan' : 'border-slate-800 opacity-75'}`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <span className="w-7 h-7 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold text-xs font-mono">
              2
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-100">PHASE 2: SECOND SIMILAR INCIDENT (INC-1078)</h2>
              <p className="text-xs text-slate-400">Different IP (198.51.100.99), but identical behavioral pattern involving account 'svc_db_sync'</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeStep >= 3 && !analysisPhase2 && (
              <button
                onClick={runPhase2}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>3. Load & Analyze INC-1078 (Triggers Hindsight Recall)</span>
              </button>
            )}

            {analysisPhase2 && (
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-cyan-400" /> ✓ Hindsight Recalled INC-1042
              </span>
            )}
          </div>
        </div>

        {/* Phase 2 Analysis & Comparison Results */}
        {analysisPhase2 && (
          <div className="space-y-4">
            <MemoryPanel
              memories={analysisPhase2.recalled_memories}
              query={analysisPhase2.memory_query}
              hasMemory={analysisPhase2.has_historical_memory}
            />

            <VisualComparison analysis={analysisPhase2} />

            <div className="p-4 rounded-lg bg-slate-900 border border-cyan-500/30 space-y-2 text-xs">
              <span className="font-bold text-cyan-300 block">Context-Aware Recommendation Informed by Hindsight:</span>
              <p className="text-slate-200 font-semibold">{analysisPhase2.summary}</p>
              <div className="pt-2 text-slate-400 italic border-t border-slate-800">
                "{analysisPhase2.reasoning}"
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-3">
              <Link
                to={`/incidents/${inc1078Id}`}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center space-x-1.5"
              >
                <span>View Full INC-1078 Investigation Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
