import { Skeleton } from '@/shared/components/Skeleton';

export function CompareAthletesSkeleton() {
  return (
    <div
      className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8"
      role="status"
      aria-label="Loading comparison"
    >
      <header>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 mt-2" />
      </header>

      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-40 mb-3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-56 rounded-full" />
          <Skeleton className="h-7 w-56 rounded-full" />
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-28 mt-2" />
            <Skeleton className="h-3 w-40 mt-3" />
            <Skeleton className="h-3 w-36 mt-2" />
          </div>
        ))}
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-56 mb-4" />
        <Skeleton className="h-80 w-full" />
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
