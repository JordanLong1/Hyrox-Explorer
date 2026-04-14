import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { loadHyroxData } from './lib/loadHyroxData';
import { PacingGuide } from './components/pacingGuide';
import { PacingGuideSkeleton } from './components/pacingGuideSkeleton';
import { Trends } from './components/trends';
import { Layout } from './components/layout';
import type { HyroxResult } from './types/hyrox';

function App() {
  const [results, setResults] = useState<HyroxResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHyroxData()
      .then(setResults)
      .catch((err) => setError(String(err)));
  }, []);

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
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PacingGuide results={results} />} />
          <Route path="trends" element={<Trends results={results} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
