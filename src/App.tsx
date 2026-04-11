import { useEffect, useState } from "react";
import { loadHyroxData } from "./lib/loadHyroxData";
import type { HyroxResult } from "./types/hyrox";

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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Hyrox Explorer</h1>
      <p className="mb-2">Loaded {results.length.toLocaleString()} results</p>
      <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(results[0], null, 2)}
      </pre>
    </div>
  );
}

export default App;