import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={clsx(
        'skeleton',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded-[var(--radius-sm)] h-4',
        variant === 'rectangular' && 'rounded-[var(--radius-md)]',
        className
      )}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-xl)] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={100} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-xl)] p-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="50%" height={12} />
          <Skeleton variant="text" width="70%" height={24} />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-xl)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="rectangular" width={80} height={32} className="rounded-[var(--radius-md)]" />
      </div>
      <div className="flex items-end justify-around h-48 gap-2 pt-4">
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <Skeleton key={i} variant="rectangular" width={32} height={`${h}%`} />
        ))}
      </div>
    </div>
  );
}

export function QualityScoreSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-xl)] p-6 flex flex-col items-center justify-center">
      <Skeleton variant="text" width={100} height={16} className="mb-4" />
      <Skeleton variant="circular" width={160} height={160} />
      <Skeleton variant="text" width={60} height={24} className="mt-4" />
    </div>
  );
}
