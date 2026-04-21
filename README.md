# Hyrox Explorer

A data visualization project exploring ~91k Hyrox race results from a public [Kaggle dataset](https://www.kaggle.com/datasets/jgug05/hyrox-results). Built with React, TypeScript, Tailwind CSS, and Recharts.

**[Live Demo](https://hyrox-explorer.vercel.app)**

## Views

- **Pacing Guide** — Enter a target finish time to see how athletes in that range typically pace their race. Shows median splits, a 16-segment chart in race order, and a station table with percentile breakdowns.
- **Trends** — Explores how the sport has grown and changed across seasons S4–S6. Season summary cards, median finish time per event, and field size charts.
- **Compare Athletes** — Side-by-side comparison of 2–4 athletes' splits across all 16 segments, with relative strength/weakness analysis.

## Architecture decisions

- **Client-side only.** The dataset is a static CSV (~91k rows) fetched once at boot, parsed with PapaParse, and held in memory. No backend, no API calls. This keeps deployment simple and the app fast after initial load.
- **Feature-module structure.** Each view owns its components, stats functions, and constants in `src/features/<name>/`. Shared utilities live in `src/shared/`. This keeps feature code colocated and routes code-split via `React.lazy`.
- **Pure stats functions.** All statistical computations are pure functions with no side effects, making them easy to test and reason about. They handle missing data (zeros in the dataset) gracefully.
- **Accessibility.** Sortable tables expose `aria-sort`, interactive elements have proper labels, status messages use appropriate ARIA roles.
- **Memoization.** Filtering and computing stats over 91k rows is expensive — derived values are memoized with `useMemo` to avoid unnecessary recomputation.

## Screenshots

<img width="1075" height="941" alt="Pacing Guide view" src="https://github.com/user-attachments/assets/b472c19d-bd2a-42c4-a4d0-539bf6682be4" />
<img width="1032" height="943" alt="Trends view" src="https://github.com/user-attachments/assets/3d9dfde2-c596-4c8e-b7a5-b42f04109f39" />

## Tech stack

- React 18 + TypeScript
- Vite (build + dev server)
- Tailwind CSS v4
- Recharts (charts)
- PapaParse (CSV parsing)
- React Router v6 (client-side routing)
- Vitest (testing)

## Running locally

```bash
npm install
npm run dev
```

## Testing

```bash
npm test            # single run
npm run test:watch  # watch mode
```

Unit tests cover the pure stats and formatting utilities across all three feature modules (56 tests).

## CI/CD

- **GitHub Actions** runs lint, type-check, tests, and build on every push and PR to main.
- **Vercel** auto-deploys from main with preview deploys on PRs.
