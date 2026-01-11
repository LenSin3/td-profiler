import type { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
  icon?: ReactNode;
  dot?: boolean;
}

const variantClasses = {
  default: `
    bg-[var(--color-surface-hover)]
    text-[var(--color-text-secondary)]
    border-[var(--color-border)]
  `,
  success: `
    bg-[var(--color-success)]/10
    text-[var(--color-success)]
    border-[var(--color-success)]/20
  `,
  warning: `
    bg-[var(--color-warning)]/10
    text-[var(--color-warning)]
    border-[var(--color-warning)]/20
  `,
  danger: `
    bg-[var(--color-danger)]/10
    text-[var(--color-danger)]
    border-[var(--color-danger)]/20
  `,
  info: `
    bg-[var(--color-info)]/10
    text-[var(--color-info)]
    border-[var(--color-info)]/20
  `,
  brand: `
    bg-[var(--color-brand)]/10
    text-[var(--color-brand)]
    border-[var(--color-brand)]/20
  `,
};

const dotColors = {
  default: 'bg-[var(--color-text-muted)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
  info: 'bg-[var(--color-info)]',
  brand: 'bg-[var(--color-brand)]',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
  icon,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5',
        'font-medium rounded-[var(--radius-full)]',
        'border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

interface TypeBadgeProps {
  type: string;
  className?: string;
}

const typeColors: Record<string, string> = {
  integer: 'brand',
  float: 'info',
  string: 'success',
  boolean: 'warning',
  datetime: 'default',
  email: 'info',
  url: 'info',
  phone: 'success',
  zipcode: 'default',
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const variant = (typeColors[type.toLowerCase()] || 'default') as BadgeProps['variant'];

  return (
    <Badge variant={variant} size="sm" className={clsx('uppercase tracking-wide font-semibold', className)}>
      {type}
    </Badge>
  );
}

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  let variant: BadgeProps['variant'] = 'success';
  if (score < 60) variant = 'danger';
  else if (score < 80) variant = 'warning';

  return (
    <Badge variant={variant} size="md" className={clsx('font-bold', className)}>
      {score}%
    </Badge>
  );
}
