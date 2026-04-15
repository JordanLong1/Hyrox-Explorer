import { useMemo, useState } from 'react';
import { useHyroxData } from '@/app/providers/DataProvider';
import { EmptyState } from '@/shared/components/EmptyState';
import type { HyroxResult } from '@/shared/types/hyrox';

import { AthleteChips } from './AthleteChips';
import { AthleteSelector } from './AthleteSelector';
import { ComparisonChart } from './ComparisonChart';
import { ComparisonTable } from './ComparisonTable';
import { SummarySection } from './SummarySection';
import { MAX_ATHLETES } from './colors';
import { athleteKey, pickSeedAthletes } from './stats';

interface SelectedAthlete {
  key: string;
  result: HyroxResult;
  isExample: boolean;
}

export function CompareAthletes() {
  const results = useHyroxData();

  // Seed once on mount. We compute inside the initializer so we don't pay for
  // it on every render; `results` is stable after the app shell's load gate.
  const [selections, setSelections] = useState<SelectedAthlete[]>(() =>
    pickSeedAthletes(results).map(({ result, rowIndex }) => ({
      key: athleteKey(result, rowIndex),
      result,
      isExample: true,
    })),
  );

  const selectedKeys = useMemo(
    () => new Set(selections.map((s) => s.key)),
    [selections],
  );

  const canAdd = selections.length < MAX_ATHLETES;

  const handleAdd = (result: HyroxResult, rowIndex: number) => {
    const key = athleteKey(result, rowIndex);
    setSelections((prev) => {
      if (prev.some((s) => s.key === key) || prev.length >= MAX_ATHLETES) {
        return prev;
      }
      return [...prev, { key, result, isExample: false }];
    });
  };

  const handleRemove = (key: string) => {
    setSelections((prev) => prev.filter((s) => s.key !== key));
  };

  const athletes = selections.map((s) => s.result);
  const hasAthletes = selections.length > 0;
  const hasExamples = selections.some((s) => s.isExample);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Compare Athletes
        </h1>
        <p className="text-gray-600 mt-1">
          Pick up to {MAX_ATHLETES} athletes and see where they win and lose
          time against each other.
        </p>
      </header>

      <section
        aria-label="Selected athletes"
        className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-3"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          Currently comparing
        </h2>
        <AthleteChips selections={selections} onRemove={handleRemove} />
        {hasExamples && (
          <p className="text-xs text-gray-500 italic">
            Example athletes are pre-loaded so the charts aren't empty. Remove
            them once you've added your own.
          </p>
        )}
      </section>

      <AthleteSelector
        results={results}
        selectedKeys={selectedKeys}
        canAdd={canAdd}
        onAdd={handleAdd}
      />

      {!hasAthletes ? (
        <EmptyState
          title="Add athletes to start comparing"
          description="Pick an event above and click an athlete's row to add them. Add two or more to see side-by-side splits."
        />
      ) : (
        <>
          <SummarySection athletes={athletes} />

          <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Segment-by-segment splits
            </h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Runs and stations in race order. Each athlete's bar uses their
              color from the chips above.
            </p>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="min-w-[720px]">
                <ComparisonChart athletes={athletes} />
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Station scoreboard
            </h2>
            <ComparisonTable athletes={athletes} />
          </section>
        </>
      )}
    </div>
  );
}
