import { BrowserRouter } from 'react-router-dom';
import { DataProvider, useDataStatus } from '@/app/providers/DataProvider';
import { AppRoutes } from '@/app/routes';
import { PacingGuideSkeleton } from '@/features/pacing-guide/PacingGuideSkeleton';

function AppShell() {
  const { results, error } = useDataStatus();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load data
          </h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PacingGuideSkeleton />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function App() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  );
}

export default App;
