import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import {
  X,
  AlertTriangle,
  XCircle,
  Info,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  Percent,
  TrendingUp,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { Badge, TypeBadge, ScoreBadge } from './ui/Badge';
import { ProgressBar } from './ui/Progress';

interface ColumnData {
  name: string;
  inferred_type: string;
  semantic_type: string | null;
  null_count: number;
  null_percentage: number;
  distinct_count: number;
  is_unique: boolean;
  stats: Record<string, number>;
  outliers: { count: number; threshold: string };
  patterns: { top_patterns?: { pattern: string; percentage: number }[] };
  quality_score: number;
  issues: { severity: string; issue: string; type: string }[];
}

interface Props {
  column: ColumnData | null;
  totalRows: number;
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons: Record<string, typeof Hash> = {
  integer: Hash,
  float: TrendingUp,
  string: Type,
  datetime: Calendar,
  boolean: ToggleLeft,
};

const ColumnDetailModal: React.FC<Props> = ({ column, totalRows, isOpen, onClose }) => {
  if (!column) return null;

  const TypeIcon = typeIcons[column.inferred_type] || Type;
  const completeness = 100 - column.null_percentage;

  // Prepare distribution data for chart
  const distributionData = [];

  if (column.inferred_type === 'string' && column.patterns?.top_patterns) {
    column.patterns.top_patterns.slice(0, 8).forEach((p) => {
      distributionData.push({
        name: p.pattern.length > 15 ? p.pattern.substring(0, 15) + '...' : p.pattern,
        value: p.percentage,
        fullName: p.pattern,
      });
    });
  } else if (['integer', 'float'].includes(column.inferred_type) && column.stats) {
    // For numeric, show a simple stats summary
    const { min, max, mean, median } = column.stats;
    if (min !== undefined) {
      distributionData.push(
        { name: 'Min', value: min },
        { name: 'Mean', value: mean || 0 },
        { name: 'Median', value: median || 0 },
        { name: 'Max', value: max }
      );
    }
  }

  const statsItems = [];

  // Add relevant stats based on type
  if (['integer', 'float'].includes(column.inferred_type) && column.stats) {
    if (column.stats.min !== undefined) statsItems.push({ label: 'Minimum', value: column.stats.min.toLocaleString() });
    if (column.stats.max !== undefined) statsItems.push({ label: 'Maximum', value: column.stats.max.toLocaleString() });
    if (column.stats.mean !== undefined) statsItems.push({ label: 'Mean', value: column.stats.mean.toFixed(2) });
    if (column.stats.median !== undefined) statsItems.push({ label: 'Median', value: column.stats.median.toFixed(2) });
    if (column.stats.std !== undefined) statsItems.push({ label: 'Std Dev', value: column.stats.std.toFixed(2) });
  } else if (column.inferred_type === 'string' && column.stats) {
    if (column.stats.min_length !== undefined) statsItems.push({ label: 'Min Length', value: column.stats.min_length });
    if (column.stats.max_length !== undefined) statsItems.push({ label: 'Max Length', value: column.stats.max_length });
    if (column.stats.mean_length !== undefined) statsItems.push({ label: 'Avg Length', value: column.stats.mean_length.toFixed(1) });
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[var(--color-brand)]/10">
                      <TypeIcon size={24} className="text-[var(--color-brand)]" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-[var(--color-text-primary)]">
                        {column.name}
                      </Dialog.Title>
                      <div className="flex items-center gap-2 mt-1">
                        <TypeBadge type={column.inferred_type} />
                        {column.semantic_type && (
                          <Badge variant="info" size="sm">
                            {column.semantic_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Quality & Completeness */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--color-text-muted)]">Quality Score</span>
                        <ScoreBadge score={column.quality_score} />
                      </div>
                      <ProgressBar
                        value={column.quality_score}
                        variant={column.quality_score >= 80 ? 'success' : column.quality_score >= 60 ? 'warning' : 'danger'}
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--color-text-muted)]">Completeness</span>
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {completeness.toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar
                        value={completeness}
                        variant={completeness >= 95 ? 'success' : completeness >= 80 ? 'warning' : 'danger'}
                      />
                      <p className="text-xs text-[var(--color-text-dim)] mt-2">
                        {column.null_count.toLocaleString()} null values out of {totalRows.toLocaleString()} rows
                      </p>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                      <BarChart3 size={16} className="text-[var(--color-accent)]" />
                      Statistics
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <p className="text-xs text-[var(--color-text-muted)]">Distinct Values</p>
                        <p className="text-lg font-bold text-[var(--color-text-primary)]">
                          {column.distinct_count.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <p className="text-xs text-[var(--color-text-muted)]">Cardinality</p>
                        <p className="text-lg font-bold text-[var(--color-text-primary)]">
                          {((column.distinct_count / totalRows) * 100).toFixed(1)}%
                        </p>
                      </div>
                      {column.is_unique && (
                        <div className="p-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
                          <p className="text-xs text-[var(--color-success)]">Unique</p>
                          <p className="text-lg font-bold text-[var(--color-success)]">Yes</p>
                        </div>
                      )}
                      {statsItems.map((stat) => (
                        <div key={stat.label} className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                          <p className="text-lg font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                        </div>
                      ))}
                      {column.outliers?.count > 0 && (
                        <div className="p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20">
                          <p className="text-xs text-[var(--color-warning)]">Outliers</p>
                          <p className="text-lg font-bold text-[var(--color-warning)]">{column.outliers.count}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Distribution Chart */}
                  {distributionData.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                        <Percent size={16} className="text-[var(--color-brand)]" />
                        {['integer', 'float'].includes(column.inferred_type) ? 'Value Range' : 'Top Patterns'}
                      </h3>
                      <div className="h-48 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distributionData} layout="vertical">
                            <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                              width={80}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                background: 'var(--color-bg-elevated)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: 'var(--color-text-primary)' }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {distributionData.map((_, index) => (
                                <Cell key={index} fill={`hsl(${260 + index * 20}, 70%, 60%)`} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-[var(--color-warning)]" />
                      Issues ({column.issues.length})
                    </h3>
                    {column.issues.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 flex items-center gap-3">
                        <ShieldCheck size={20} className="text-[var(--color-success)]" />
                        <p className="text-sm text-[var(--color-success)]">No issues detected for this column</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {column.issues.map((issue, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`p-3 rounded-lg border flex items-start gap-3 ${
                              issue.severity === 'critical'
                                ? 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/20'
                                : issue.severity === 'warning'
                                ? 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20'
                                : 'bg-[var(--color-info)]/10 border-[var(--color-info)]/20'
                            }`}
                          >
                            {issue.severity === 'critical' ? (
                              <XCircle size={16} className="text-[var(--color-danger)] mt-0.5 shrink-0" />
                            ) : issue.severity === 'warning' ? (
                              <AlertTriangle size={16} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
                            ) : (
                              <Info size={16} className="text-[var(--color-info)] mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p className="text-sm text-[var(--color-text-secondary)]">{issue.issue}</p>
                              <p className="text-xs text-[var(--color-text-dim)] mt-1">Type: {issue.type}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ColumnDetailModal;
