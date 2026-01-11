import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const variantColors = {
  default: 'bg-[var(--color-text-muted)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
  brand: 'bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-accent)]',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  variant = 'brand',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={clsx(
          'w-full rounded-full overflow-hidden',
          'bg-[var(--color-surface)]',
          sizeClasses[size]
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantColors[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface QualityRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showGrade?: boolean;
  animated?: boolean;
  className?: string;
}

const ringSizes = {
  sm: { width: 80, stroke: 6, radius: 34 },
  md: { width: 140, stroke: 10, radius: 60 },
  lg: { width: 180, stroke: 12, radius: 78 },
};

function getScoreColor(score: number): string {
  if (score >= 90) return 'var(--color-success)';
  if (score >= 80) return 'var(--color-success-light)';
  if (score >= 70) return 'var(--color-warning)';
  if (score >= 60) return 'var(--color-warning-light)';
  return 'var(--color-danger)';
}

function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function QualityRing({
  score,
  size = 'md',
  showGrade = true,
  animated = true,
  className,
}: QualityRingProps) {
  const { width, stroke, radius } = ringSizes[size];
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;
  const center = width / 2;
  const color = getScoreColor(score);
  const grade = getGrade(score);

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg
        width={width}
        height={width}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-[var(--color-surface)]"
        />
        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className={clsx(
            'transition-all duration-1000 ease-out',
            animated && 'progress-ring-animated'
          )}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={clsx(
            'font-black',
            size === 'sm' && 'text-xl',
            size === 'md' && 'text-4xl',
            size === 'lg' && 'text-5xl'
          )}
        >
          {score}
        </span>
        {showGrade && (
          <span
            className={clsx(
              'font-bold',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
            style={{ color }}
          >
            Grade {grade}
          </span>
        )}
      </div>
    </div>
  );
}
