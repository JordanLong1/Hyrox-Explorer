import { createContext } from 'react';
import type { HyroxResult } from '@/shared/types/hyrox';

export interface DataState {
  results: HyroxResult[] | null;
  error: string | null;
}

export const DataContext = createContext<DataState | null>(null);
