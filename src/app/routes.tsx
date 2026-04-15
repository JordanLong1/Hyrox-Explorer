import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { PacingGuideSkeleton } from '@/features/pacing-guide/PacingGuideSkeleton';
import { TrendsSkeleton } from '@/features/trends/TrendsSkeleton';
import { CompareAthletesSkeleton } from '@/features/compare-athletes/CompareAthletesSkeleton';

const PacingGuide = lazy(() =>
  import('@/features/pacing-guide/PacingGuide').then((m) => ({
    default: m.PacingGuide,
  })),
);
const Trends = lazy(() =>
  import('@/features/trends/Trends').then((m) => ({ default: m.Trends })),
);
const CompareAthletes = lazy(() =>
  import('@/features/compare-athletes/CompareAthletes').then((m) => ({
    default: m.CompareAthletes,
  })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<PacingGuideSkeleton />}>
              <PacingGuide />
            </Suspense>
          }
        />
        <Route
          path="trends"
          element={
            <Suspense fallback={<TrendsSkeleton />}>
              <Trends />
            </Suspense>
          }
        />
        <Route
          path="compare"
          element={
            <Suspense fallback={<CompareAthletesSkeleton />}>
              <CompareAthletes />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
