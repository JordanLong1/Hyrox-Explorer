import { Skeleton } from '@/shared/components/Skeleton';

/**
 * Layout-mirroring skeleton for the Pacing Guide. Renders the same overall
 * structure as the real page so the transition to loaded content feels
 * stable instead of jarring.
 */
export function PacingGuideSkeleton() {
  return (
    <div
      className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8"
      role="status"
      aria-label="Loading race results"
    >
      {/* Header */}
      <header>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 mt-2" />
      </header>

      {/* Filters card */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-20 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </section>

      {/* Headline stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20 mt-2" />
          </div>
        ))}
      </section>

      {/* Sample size note */}
      <Skeleton className="h-4 w-72" />

      {/* Chart card */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <Skeleton className="h-5 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </section>

      {/* Station table card */}
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
