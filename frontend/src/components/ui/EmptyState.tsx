import type { ReactNode } from 'react';
import clsx from 'clsx';
import { FileQuestion, Upload, AlertCircle, Database, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-6',
        className
      )}
    >
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoDataUploaded({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<Upload size={32} />}
      title="No dataset uploaded"
      description="Upload a CSV, Excel, or JSON file to start profiling your data quality."
      action={onUpload ? { label: 'Upload Dataset', onClick: onUpload } : undefined}
    />
  );
}

export function NoIssuesFound() {
  return (
    <EmptyState
      icon={<Database size={32} />}
      title="No issues found"
      description="Your dataset looks clean! No data quality issues were detected."
    />
  );
}

export function NoInsightsGenerated({ onGenerate }: { onGenerate: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles size={32} />}
      title="Ready to analyze"
      description="Generate AI-powered insights to get recommendations for improving your data quality."
      action={{ label: 'Generate Insights', onClick: onGenerate }}
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while processing your request.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertCircle size={32} className="text-[var(--color-danger)]" />}
      title={title}
      description={description}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
    />
  );
}

export function NoResultsFound({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<FileQuestion size={32} />}
      title="No results found"
      description={
        query
          ? `No matches found for "${query}". Try adjusting your search.`
          : 'No matching results. Try adjusting your filters.'
      }
    />
  );
}
