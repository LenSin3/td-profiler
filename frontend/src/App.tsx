import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import FileUploader from './components/FileUploader';
import OverviewDashboard from './components/OverviewDashboard';
import InsightsPanel from './components/InsightsPanel';
import LandingPage from './components/LandingPage';

import './index.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>();

  const onUploadSuccess = (id: string, name?: string) => {
    setJobId(id);
    setFileName(name);
    setStatus('processing');
    setActiveTab('dashboard');
  };

  // Show landing page
  if (showLanding) {
    return (
      <>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'glass text-sm',
            style: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            },
          }}
        />
        <LandingPage onGetStarted={() => setShowLanding(false)} />
      </>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <div className="min-h-screen flex">
      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'glass text-sm',
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-danger)',
              secondary: 'white',
            },
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasData={!!jobId}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        fileName={fileName}
      />

      {/* Main content */}
      <main
        className={clsx(
          'flex-1 flex flex-col min-h-screen',
          'transition-all duration-300 ease-out',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Header */}
        <Header activeTab={activeTab} status={status} />

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="h-full flex items-center justify-center p-8"
              >
                <FileUploader onSuccess={onUploadSuccess} />
              </motion.div>
            )}

            {activeTab === 'dashboard' && jobId && (
              <motion.div
                key="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <OverviewDashboard
                  jobId={jobId}
                  status={status}
                  onStatusUpdate={setStatus}
                />
              </motion.div>
            )}

            {activeTab === 'insights' && jobId && (
              <motion.div
                key="insights"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <InsightsPanel jobId={jobId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-[var(--color-border)] text-center">
          <p className="text-xs text-[var(--color-text-dim)]">
            TD Profiler &copy; 2026 &middot; AI-Powered Data Quality Analysis
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
