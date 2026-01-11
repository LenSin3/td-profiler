import clsx from 'clsx';
import { Upload, LayoutDashboard, Brain, Clock } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  status?: 'idle' | 'processing' | 'completed' | 'failed';
}

const tabInfo: Record<string, { icon: React.ReactNode; title: string; description: string }> = {
  upload: {
    icon: <Upload size={20} />,
    title: 'Upload Dataset',
    description: 'Import your data file for quality analysis',
  },
  dashboard: {
    icon: <LayoutDashboard size={20} />,
    title: 'Quality Dashboard',
    description: 'Overview of your data quality metrics',
  },
  insights: {
    icon: <Brain size={20} />,
    title: 'AI Insights',
    description: 'LLM-powered analysis and recommendations',
  },
};

const statusConfig = {
  idle: null,
  processing: {
    icon: <Clock size={14} className="animate-pulse" />,
    label: 'Processing',
    className: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
  },
  completed: {
    icon: null,
    label: 'Complete',
    className: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
  },
  failed: {
    icon: null,
    label: 'Failed',
    className: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20',
  },
};

export function Header({ activeTab, status = 'idle' }: HeaderProps) {
  const tab = tabInfo[activeTab];
  const statusInfo = statusConfig[status];

  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] text-[var(--color-brand)]">
          {tab.icon}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {tab.title}
            </h2>
            {statusInfo && (
              <span
                className={clsx(
                  'inline-flex items-center gap-1.5',
                  'px-2.5 py-1 rounded-full',
                  'text-xs font-medium border',
                  statusInfo.className
                )}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {tab.description}
          </p>
        </div>
      </div>
    </header>
  );
}
