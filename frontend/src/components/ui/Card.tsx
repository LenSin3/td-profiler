import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
  overflow?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  hover = false,
  padding = 'md',
  glow = false,
  overflow = false
}: CardProps) {
  return (
    <div
      className={clsx(
        'glass rounded-[var(--radius-xl)] transition-all duration-200',
        paddingClasses[padding],
        hover && 'glass-hover cursor-pointer',
        glow && 'glow',
        !overflow && 'overflow-visible',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ children, className, icon, action }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            {icon}
          </div>
        )}
        <div>{children}</div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  subtitle?: string;
}

export function CardTitle({ children, className, subtitle }: CardTitleProps) {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {children}
      </h3>
      {subtitle && (
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={className}>{children}</div>;
}
