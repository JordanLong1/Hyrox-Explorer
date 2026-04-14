import { useHyroxData } from '@/app/providers/DataProvider';

export function Trends() {
  const results = useHyroxData();
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trends</h1>
        <p className="text-gray-600 mt-1">
          How Hyrox is changing over time. Coming soon. (
          {results.length.toLocaleString()} results loaded.)
        </p>
      </header>
    </div>
  );
}
