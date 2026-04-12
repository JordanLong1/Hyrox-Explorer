interface SkeletonProps {
  className?: string;
}

/**
 * A shimmering placeholder block. Compose multiple of these to build
 * skeleton screens that mirror your real layout.
 *
 * Usage: <Skeleton className="h-6 w-32" />
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}
