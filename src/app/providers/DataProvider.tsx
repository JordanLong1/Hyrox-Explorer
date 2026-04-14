import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { loadHyroxData } from '@/shared/lib/loadHyroxData';
import type { HyroxResult } from '@/shared/types/hyrox';

interface DataState {
  results: HyroxResult[] | null;
  error: string | null;
}

const DataContext = createContext<DataState | null>(null);

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

/**
 * Returns the loaded results. Throws if called outside `<DataProvider>` or
 * before data has loaded — components that consume this must be rendered
 * only after the loading/error gate in `App.tsx` has resolved.
 */
export function useHyroxData(): HyroxResult[] {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useHyroxData must be used within <DataProvider>');
  }
  if (!ctx.results) {
    throw new Error('useHyroxData called before data finished loading');
  }
  return ctx.results;
}

/**
 * Returns raw loading/error state. Used by the top-level shell to decide
 * whether to render the skeleton, an error panel, or the routed app.
 */
export function useDataStatus(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useDataStatus must be used within <DataProvider>');
  }
  return ctx;
}
