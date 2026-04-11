import { useEffect, useState } from 'react';
import { loadHyroxData } from './lib/loadHyroxData';
import { PacingGuide } from './components/pacingGuide';
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
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!results) {
    return <div className="p-8 text-gray-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PacingGuide results={results} />
    </div>
  );
}

export default App;
