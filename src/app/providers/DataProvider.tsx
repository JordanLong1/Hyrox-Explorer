import { useEffect, useState, type ReactNode } from 'react';
import { loadHyroxData } from '@/shared/lib/loadHyroxData';
import { DataContext, type DataState } from './DataContext';

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({
    results: null,
    error: null,
  });

  useEffect(() => {
    loadHyroxData()
      .then((results) => setState({ results, error: null }))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setState({ results: null, error: message });
      });
  }, []);

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
}
