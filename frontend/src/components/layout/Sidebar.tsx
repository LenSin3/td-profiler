import type { ReactNode } from 'react';
import clsx from 'clsx';
import {
  Upload,
  LayoutDashboard,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasData: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onGoHome: () => void;
  fileName?: string;
}

export function Sidebar({
  activeTab,
  onTabChange,
  hasData,
  collapsed,
  onToggleCollapse,
  onGoHome,
  fileName,
}: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'upload', label: 'Upload', icon: <Upload size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, disabled: !hasData },
    { id: 'insights', label: 'AI Insights', icon: <Brain size={20} />, disabled: !hasData },
  ];

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-40',
        'flex flex-col',
        'bg-[var(--color-bg-secondary)]',
        'border-r border-[var(--color-border)]',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo - clickable to go back to landing */}
      <button
        onClick={onGoHome}
        className="flex items-center gap-3 p-4 border-b border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors duration-200 w-full text-left"
        title="Back to home"
      >
        <img src="/logo.svg" alt="TD Profiler" className="shrink-0 w-10 h-10" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg gradient-text whitespace-nowrap">
              TD Profiler
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
              Data Quality Analyzer
            </p>
          </div>
        )}
      </button>

      {/* File indicator */}
      {hasData && fileName && (
        <div
          className={clsx(
            'mx-3 mt-4 p-3',
            'rounded-[var(--radius-lg)]',
            'bg-[var(--color-surface)]',
            'border border-[var(--color-border)]',
            collapsed && 'hidden'
          )}
        >
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <FileText size={12} />
            <span>Current File</span>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {fileName}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const button = (
            <button
              key={item.id}
              onClick={() => !item.disabled && onTabChange(item.id)}
              disabled={item.disabled}
              className={clsx(
                'w-full flex items-center gap-3',
                'rounded-[var(--radius-lg)] transition-all duration-200',
                collapsed ? 'p-3 justify-center' : 'px-4 py-3',
                isActive
                  ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)] border border-[var(--color-brand)]/20'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]',
                item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
              )}
            >
              <span className={clsx(isActive && 'text-[var(--color-brand)]')}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} content={item.label} position="right">
                {button}
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <button
          onClick={onToggleCollapse}
          className={clsx(
            'w-full flex items-center justify-center gap-2',
            'p-2 rounded-[var(--radius-lg)]',
            'text-[var(--color-text-muted)]',
            'hover:text-[var(--color-text-primary)]',
            'hover:bg-[var(--color-surface)]',
            'transition-all duration-200'
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
