import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { NewIncident } from './pages/NewIncident';
import { IncidentInvestigation } from './pages/IncidentInvestigation';
import { MemoryExplorer } from './pages/MemoryExplorer';
import { IncidentHistory } from './pages/IncidentHistory';
import { Settings } from './pages/Settings';
import { DemoScenarioPage } from './pages/DemoScenarioPage';

import { fetchSystemStatus } from './services/api';
import { SystemStatus } from './types';

export const App: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const status = await fetchSystemStatus();
        setSystemStatus(status);
      } catch (err) {
        console.error('System status error:', err);
      }
    }
    loadStatus();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
        <Header systemStatus={systemStatus} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-incident" element={<NewIncident />} />
            <Route path="/incidents/:id" element={<IncidentInvestigation />} />
            <Route path="/memories" element={<MemoryExplorer />} />
            <Route path="/history" element={<IncidentHistory />} />
            <Route path="/demo" element={<DemoScenarioPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-800/80 py-4 bg-[#0B0F17]/90 text-center text-[11px] text-slate-500 font-mono">
          MemorySec AI Incident Response Agent • Powered by Hindsight Memory Bank
        </footer>
      </div>
    </Router>
  );
};

export default App;
