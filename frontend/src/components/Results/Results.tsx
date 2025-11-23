/**
 * Results Component
 * =================
 * Displays aggregated survey results including totals, age statistics,
 * food preferences, and rating averages.
 *
 * Features:
 * - Automatic data formatting (decimals, integers, percentages)
 * - Loading and error state handling
 * - Empty state messaging
 * - Responsive card layout
 * - Optimized rendering with memoization
 *
 * @component
 * @returns {JSX.Element} Rendered results display or loading/error state
 *
 * @dependencies
 * - useResults hook: Provides survey results data via React Query
 * - Loading, ErrorMessage: UI components for state display
 * - formatDecimal, formatInteger, formatPercentage, formatAge: Number formatters
 *
 * @example
 * <Results />
 *
 * @throws {Error} Gracefully displays error state with retry option
 */

import { useMemo, memo } from 'react';
import { useResults } from '@/hooks/useQuery';
import { Loading, ErrorMessage } from '@/components/ui';
import {
  formatDecimal,
  formatPercentage,
  formatAge,
} from '@/utils/numberFormatters';
import {
  RESULTS_LABELS,
  RESULTS_LOADING,
  RESULTS_ERROR,
  RESULTS_EMPTY,
} from './Results.constants';
import styles from './Results.module.css';

/**
 * Individual result row component
 *
 * Displays a labeled result with its value in a highlighted row.
 * Memoized to prevent unnecessary re-renders.
 *
 * @component
 * @param {Object} props Component props
 * @param {string} props.label Result label/description
 * @param {string | number} props.value Result value to display
 * @returns {JSX.Element} Rendered result row
 */
const ResultRow = memo(
  ({ label, value }: { label: string; value: string | number }) => (
    <div className={styles.resultRow}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  ),
);

ResultRow.displayName = 'ResultRow';

/**
 * Results display component
 *
 * Fetches and displays aggregated survey data with proper formatting.
 * Handles loading, error, and empty states gracefully.
 *
 * @returns {JSX.Element} Results card or appropriate state display
 */
function Results() {
  const { data: results, isLoading, error, refetch } = useResults();

  // Memoize destructured values to prevent unnecessary re-renders
  const resultValues = useMemo(() => {
    if (!results) return null;
    return {
      totalCount: results.totalCount,
      age: results.age,
      foodPercentages: results.foodPercentages,
      avgRatings: results.avgRatings,
    };
  }, [results]);

  if (isLoading) {
    return <Loading text={RESULTS_LOADING.MESSAGE} />;
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : RESULTS_ERROR.GENERIC_MESSAGE;
    return (
      <ErrorMessage
        message={errorMessage}
        title={RESULTS_ERROR.TITLE}
        showRetry
        onRetry={() => refetch()}
      />
    );
  }

  if (!results || results.totalCount === 0) {
    return (
      <ErrorMessage
        message={RESULTS_EMPTY.MESSAGE}
        title={RESULTS_EMPTY.TITLE}
        severity="info"
      />
    );
  }

  const {
    totalCount,
    age: { avg, min, max },
    foodPercentages: { pizza, pasta, papAndWors },
    avgRatings: { movies, radio, eatOut, tv },
  } = resultValues!;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>
          <span aria-hidden="true">📊 </span>
          <span>{RESULTS_LABELS.HEADING}</span>
        </h2>

        <ResultRow label={RESULTS_LABELS.TOTAL_SURVEYS} value={totalCount} />
        <ResultRow label={RESULTS_LABELS.AVERAGE_AGE} value={formatAge(avg)} />
        <ResultRow
          label={RESULTS_LABELS.OLDEST_PARTICIPANT}
          value={formatAge(max)}
        />
        <ResultRow
          label={RESULTS_LABELS.YOUNGEST_PARTICIPANT}
          value={formatAge(min)}
        />

        <div className={styles.spacer} />

        <ResultRow
          label={RESULTS_LABELS.PIZZA_PREFERENCE}
          value={formatPercentage(pizza)}
        />
        <ResultRow
          label={RESULTS_LABELS.PASTA_PREFERENCE}
          value={formatPercentage(pasta)}
        />
        <ResultRow
          label={RESULTS_LABELS.PAP_WORS_PREFERENCE}
          value={formatPercentage(papAndWors)}
        />

        <div className={styles.spacer} />

        <ResultRow
          label={RESULTS_LABELS.MOVIES_RATING}
          value={formatDecimal(movies)}
        />
        <ResultRow
          label={RESULTS_LABELS.RADIO_RATING}
          value={formatDecimal(radio)}
        />
        <ResultRow
          label={RESULTS_LABELS.EATOUT_RATING}
          value={formatDecimal(eatOut)}
        />
        <ResultRow label={RESULTS_LABELS.TV_RATING} value={formatDecimal(tv)} />
      </div>
    </div>
  );
}

export default memo(Results);

Results.displayName = 'Results';
