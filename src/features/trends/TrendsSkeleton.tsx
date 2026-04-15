import { Skeleton } from '@/shared/components/Skeleton';

export function TrendsSkeleton() {
  return (
    <div
      className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8"
      role="status"
      aria-label="Loading trends"
    >
      <header>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80 mt-2" />
      </header>

      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-20 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 mt-3" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        ))}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-64 mb-4" />
        <Skeleton className="h-72 w-full" />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-52 w-full" />
      </section>
    </div>
  );
}
