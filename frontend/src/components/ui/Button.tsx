import type { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses = {
  primary: `
    bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-accent)]
    hover:from-[var(--color-brand-dark)] hover:to-[#9333ea]
    text-white font-semibold
    shadow-lg shadow-[var(--color-brand)]/20
    hover:shadow-xl hover:shadow-[var(--color-brand)]/30
    hover:-translate-y-0.5
  `,
  secondary: `
    bg-[var(--color-surface)]
    border border-[var(--color-border)]
    hover:bg-[var(--color-surface-hover)]
    hover:border-[var(--color-border-light)]
    text-[var(--color-text-primary)]
  `,
  ghost: `
    bg-transparent
    hover:bg-[var(--color-surface)]
    text-[var(--color-text-secondary)]
    hover:text-[var(--color-text-primary)]
  `,
  danger: `
    bg-[var(--color-danger)]
    hover:bg-[var(--color-danger-light)]
    text-white font-semibold
    shadow-lg shadow-[var(--color-danger)]/20
  `,
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-[var(--radius-md)]',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-[var(--radius-lg)]',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-[var(--radius-lg)]',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center',
        'transition-all duration-200',
        'focus-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

const iconSizeClasses = {
  sm: 'p-1.5 rounded-[var(--radius-md)]',
  md: 'p-2 rounded-[var(--radius-lg)]',
  lg: 'p-3 rounded-[var(--radius-lg)]',
};

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center',
        'transition-all duration-200',
        'focus-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        iconSizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
