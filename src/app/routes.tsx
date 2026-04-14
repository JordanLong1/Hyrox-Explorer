import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { PacingGuideSkeleton } from '@/features/pacing-guide/PacingGuideSkeleton';

const PacingGuide = lazy(() =>
  import('@/features/pacing-guide/PacingGuide').then((m) => ({
    default: m.PacingGuide,
  })),
);
const Trends = lazy(() =>
  import('@/features/trends/Trends').then((m) => ({ default: m.Trends })),
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
            <Suspense fallback={null}>
              <Trends />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
