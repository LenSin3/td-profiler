import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import {
  Database,
  Columns3,
  Copy,
  HardDrive,
  AlertTriangle,
  XCircle,
  Info,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Card, CardHeader, CardTitle } from './ui/Card';
import { Badge, TypeBadge, ScoreBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { QualityRing, ProgressBar } from './ui/Progress';
import { Tooltip } from './ui/Tooltip';
import {
  QualityScoreSkeleton,
  StatCardSkeleton,
  CardSkeleton,
  TableRowSkeleton,
} from './ui/Skeleton';
import { NoIssuesFound, ErrorState } from './ui/EmptyState';
import ColumnDetailModal from './ColumnDetailModal';
import { API_BASE_URL } from '../config';

interface Props {
  jobId: string;
  status: string;
  onStatusUpdate: (status: 'idle' | 'processing' | 'completed' | 'failed') => void;
}

// Match actual API response structure
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

interface ProfileData {
  summary: {
    quality_score: number;
    quality_grade: string;
    row_count: number;
    column_count: number;
    duplicate_rows: number;
    memory_mb: number;
  };
  columns: ColumnData[];
}

const columnHelper = createColumnHelper<ColumnData>();

const OverviewDashboard: React.FC<Props> = ({ jobId, status, onStatusUpdate }) => {
  const [data, setData] = useState<ProfileData | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<ColumnData | null>(null);

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    setExporting(format);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/report/${jobId}?format=${format}`,
        { responseType: 'blob' }
      );

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition'];
      const contentType = response.headers['content-type'];
      let filename = `profile_export.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show appropriate message based on actual content type
      const actualFormat = contentType?.includes('html') ? 'HTML' : format.toUpperCase();
      toast.success(`${actualFormat} exported successfully!`);
    } catch (err) {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profile/${jobId}`);
        if (response.data.status === 'completed') {
          setData(response.data.result);
          onStatusUpdate('completed');
        } else if (response.data.status === 'failed') {
          setError(response.data.error || 'Processing failed');
          onStatusUpdate('failed');
        } else {
          setTimeout(fetchResults, 2000);
        }
      } catch (err) {
        setError('Failed to fetch results');
        onStatusUpdate('failed');
      }
    };

    if (status === 'processing') {
      fetchResults();
    }
  }, [jobId, status, onStatusUpdate]);

  // Calculate issues summary from columns
  const issuesSummary = useMemo(() => {
    if (!data) return { critical: 0, warning: 0, info: 0 };

    let critical = 0;
    let warning = 0;
    let info = 0;

    data.columns.forEach((col) => {
      col.issues.forEach((issue) => {
        if (issue.severity === 'critical') critical++;
        else if (issue.severity === 'warning') warning++;
        else info++;
      });
    });

    return { critical, warning, info };
  }, [data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Column Name',
        cell: (info) => (
          <span className="font-medium text-[var(--color-text-primary)]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('inferred_type', {
        header: 'Type',
        cell: (info) => <TypeBadge type={info.getValue()} />,
      }),
      columnHelper.accessor('semantic_type', {
        header: 'Semantic',
        cell: (info) => {
          const value = info.getValue();
          return value ? (
            <Badge variant="info" size="sm">
              {value}
            </Badge>
          ) : (
            <span className="text-[var(--color-text-dim)]">—</span>
          );
        },
      }),
      columnHelper.accessor('null_percentage', {
        id: 'completeness',
        header: 'Completeness',
        cell: (info) => {
          const nullPct = info.getValue();
          const completeness = 100 - nullPct;
          return (
            <div className="flex items-center gap-3 min-w-[120px]">
              <ProgressBar
                value={completeness}
                size="sm"
                variant={completeness >= 95 ? 'success' : completeness >= 80 ? 'warning' : 'danger'}
                className="flex-1"
              />
              <span className="text-xs text-[var(--color-text-muted)] w-10 text-right">
                {completeness.toFixed(0)}%
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('quality_score', {
        header: 'Score',
        cell: (info) => <ScoreBadge score={info.getValue()} />,
      }),
      columnHelper.accessor('issues', {
        header: 'Issues',
        cell: (info) => {
          const issues = info.getValue();
          if (issues.length === 0) {
            return (
              <Badge variant="success" size="sm" icon={<ShieldCheck size={12} />}>
                Clean
              </Badge>
            );
          }
          const critical = issues.filter((i) => i.severity === 'critical').length;
          const warning = issues.filter((i) => i.severity === 'warning').length;
          const infoCount = issues.filter((i) => i.severity === 'info').length;
          return (
            <div className="flex items-center gap-1.5">
              {critical > 0 && (
                <Tooltip content={`${critical} critical issue${critical > 1 ? 's' : ''}`}>
                  <Badge variant="danger" size="sm">
                    {critical}
                  </Badge>
                </Tooltip>
              )}
              {warning > 0 && (
                <Tooltip content={`${warning} warning${warning > 1 ? 's' : ''}`}>
                  <Badge variant="warning" size="sm">
                    {warning}
                  </Badge>
                </Tooltip>
              )}
              {infoCount > 0 && critical === 0 && warning === 0 && (
                <Tooltip content={`${infoCount} info`}>
                  <Badge variant="info" size="sm">
                    {infoCount}
                  </Badge>
                </Tooltip>
              )}
            </div>
          );
        },
        enableSorting: false,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: data?.columns || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Loading state
  if (status === 'processing') {
    return (
      <div className="space-y-6">
        {/* Loading header */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-[var(--color-brand)]/20 border-t-[var(--color-brand)] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="text-[var(--color-brand)]" size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Analyzing Data Quality
          </h2>
          <p className="text-[var(--color-text-muted)]">
            Running profiling algorithms and detecting anomalies...
          </p>
        </div>

        {/* Skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QualityScoreSkeleton />
          <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <ErrorState
          title="Analysis Failed"
          description={error}
          onRetry={() => window.location.reload()}
        />
      </Card>
    );
  }

  if (!data) return null;

  const { summary } = data;
  const totalIssues = issuesSummary.critical + issuesSummary.warning + issuesSummary.info;

  const stats = [
    {
      label: 'Total Rows',
      value: summary.row_count.toLocaleString(),
      icon: Database,
      color: 'text-[var(--color-brand)]',
      bgColor: 'bg-[var(--color-brand)]/10',
    },
    {
      label: 'Columns',
      value: summary.column_count,
      icon: Columns3,
      color: 'text-[var(--color-accent)]',
      bgColor: 'bg-[var(--color-accent)]/10',
    },
    {
      label: 'Duplicates',
      value: summary.duplicate_rows,
      icon: Copy,
      color: 'text-[var(--color-warning)]',
      bgColor: 'bg-[var(--color-warning)]/10',
    },
    {
      label: 'Memory',
      value: `${summary.memory_mb.toFixed(2)} MB`,
      icon: HardDrive,
      color: 'text-[var(--color-success)]',
      bgColor: 'bg-[var(--color-success)]/10',
    },
  ];

  const issueBreakdown = [
    {
      label: 'Critical',
      count: issuesSummary.critical,
      icon: XCircle,
      color: 'text-[var(--color-danger)]',
      bgColor: 'bg-[var(--color-danger)]',
    },
    {
      label: 'Warning',
      count: issuesSummary.warning,
      icon: AlertTriangle,
      color: 'text-[var(--color-warning)]',
      bgColor: 'bg-[var(--color-warning)]',
    },
    {
      label: 'Info',
      count: issuesSummary.info,
      icon: Info,
      color: 'text-[var(--color-info)]',
      bgColor: 'bg-[var(--color-info)]',
    },
  ];

  const columnsWithIssues = data.columns.filter((c) => c.issues.length > 0);

  return (
    <div className="space-y-6">
      {/* Top section: Score + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quality Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full flex flex-col items-center justify-center text-center py-8">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
              Overall Quality
            </p>
            <QualityRing score={summary.quality_score} size="lg" />
          </Card>
        </motion.div>

        {/* Stats grid */}
        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card hover className="h-full">
                <div className="flex items-center gap-4">
                  <div className={clsx('p-3 rounded-[var(--radius-lg)]', stat.bgColor)}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-muted)]">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[var(--radius-lg)] bg-[var(--color-brand)]/10">
                <Download size={18} className="text-[var(--color-brand)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">Export Results</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Download your profiling analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="Download as JSON">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FileJson size={16} />}
                  onClick={() => handleExport('json')}
                  loading={exporting === 'json'}
                  disabled={exporting !== null}
                >
                  JSON
                </Button>
              </Tooltip>
              <Tooltip content="Download as CSV">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<FileSpreadsheet size={16} />}
                  onClick={() => handleExport('csv')}
                  loading={exporting === 'csv'}
                  disabled={exporting !== null}
                >
                  CSV
                </Button>
              </Tooltip>
              <Tooltip content="Download HTML report">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FileText size={16} />}
                  onClick={() => handleExport('pdf')}
                  loading={exporting === 'pdf'}
                  disabled={exporting !== null}
                >
                  HTML Report
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Issues section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader icon={<AlertCircle size={18} />}>
              <CardTitle subtitle={`${totalIssues} total issues detected`}>
                Issues Summary
              </CardTitle>
            </CardHeader>

            <div className="space-y-4">
              {issueBreakdown.map((issue) => (
                <div key={issue.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx('p-2 rounded-[var(--radius-md)]', `${issue.bgColor}/10`)}>
                      <issue.icon size={16} className={issue.color} />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {issue.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ProgressBar
                      value={issue.count}
                      max={Math.max(totalIssues, 1)}
                      variant={
                        issue.label === 'Critical'
                          ? 'danger'
                          : issue.label === 'Warning'
                          ? 'warning'
                          : 'brand'
                      }
                      size="sm"
                      className="w-24"
                    />
                    <span className="text-sm font-bold text-[var(--color-text-primary)] w-8 text-right">
                      {issue.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Column issues list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="h-full max-h-[340px] flex flex-col">
            <CardHeader icon={<AlertTriangle size={18} />}>
              <CardTitle subtitle={`${columnsWithIssues.length} columns need attention`}>
                Column Issues
              </CardTitle>
            </CardHeader>

            {columnsWithIssues.length === 0 ? (
              <NoIssuesFound />
            ) : (
              <div className="flex-1 overflow-auto -mx-6 px-6 space-y-3">
                {columnsWithIssues.slice(0, 5).map((col) => (
                  <div
                    key={col.name}
                    className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[var(--color-brand)]">{col.name}</span>
                      <TypeBadge type={col.inferred_type} />
                    </div>
                    <div className="space-y-1.5">
                      {col.issues.slice(0, 2).map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          {issue.severity === 'critical' ? (
                            <XCircle size={14} className="text-[var(--color-danger)] mt-0.5 shrink-0" />
                          ) : issue.severity === 'warning' ? (
                            <AlertTriangle size={14} className="text-[var(--color-warning)] mt-0.5 shrink-0" />
                          ) : (
                            <Info size={14} className="text-[var(--color-info)] mt-0.5 shrink-0" />
                          )}
                          <span className="text-[var(--color-text-muted)]">{issue.issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Column details table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card padding="none">
          <div className="p-6 border-b border-[var(--color-border)]">
            <CardHeader icon={<Columns3 size={18} />}>
              <CardTitle subtitle="Click any row to see detailed analysis">
                Column Analysis
              </CardTitle>
            </CardHeader>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={clsx(
                          header.column.getCanSort() && 'cursor-pointer select-none hover:text-[var(--color-text-primary)]'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-[var(--color-text-dim)]">
                              {{
                                asc: <ChevronUp size={14} />,
                                desc: <ChevronDown size={14} />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ChevronUp size={14} className="opacity-0 group-hover:opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRowSkeleton columns={6} />
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedColumn(row.original)}
                      className="cursor-pointer hover:bg-[var(--color-brand)]/5 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Column Detail Modal */}
      <ColumnDetailModal
        column={selectedColumn}
        totalRows={data?.summary.row_count || 0}
        isOpen={selectedColumn !== null}
        onClose={() => setSelectedColumn(null)}
      />
    </div>
  );
};

export default OverviewDashboard;
