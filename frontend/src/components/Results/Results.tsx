import { useResults } from '@/hooks/useQuery';
import { Loading, ErrorMessage } from '@/components/ui';
import { formatDecimal, formatPercentage } from '@/utils/numberFormatters';
import {
  RESULTS_LABELS,
  RESULTS_LOADING,
  RESULTS_ERROR,
  RESULTS_EMPTY,
} from './Results.constants';
import styles from './Results.module.css';

function ResultRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className={styles.resultRow}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

function Results() {
  const { data: results, isLoading, error, refetch } = useResults();

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
      />
    );
  }

  return (
    <div className={styles.resultsCard}>
      <h2 className={styles.heading}>{RESULTS_LABELS.HEADING}</h2>

      <ResultRow
        label={RESULTS_LABELS.TOTAL_SURVEYS}
        value={results.totalCount}
      />

      <ResultRow
        label={RESULTS_LABELS.AVERAGE_AGE}
        value={formatDecimal(results.age.avg)}
      />

      <ResultRow
        label={RESULTS_LABELS.OLDEST_PARTICIPANT}
        value={formatDecimal(results.age.max)}
      />

      <ResultRow
        label={RESULTS_LABELS.YOUNGEST_PARTICIPANT}
        value={formatDecimal(results.age.min)}
      />

      <ResultRow
        label={RESULTS_LABELS.PIZZA_PREFERENCE}
        value={formatPercentage(results.foodPercentages.pizza)}
      />

      <ResultRow
        label={RESULTS_LABELS.PASTA_PREFERENCE}
        value={formatPercentage(results.foodPercentages.pasta)}
      />

      <ResultRow
        label={RESULTS_LABELS.PAP_WORS_PREFERENCE}
        value={formatPercentage(results.foodPercentages.papAndWors)}
      />

      <ResultRow
        label={RESULTS_LABELS.MOVIES_RATING}
        value={formatDecimal(results.avgRatings.movies)}
      />

      <ResultRow
        label={RESULTS_LABELS.RADIO_RATING}
        value={formatDecimal(results.avgRatings.radio)}
      />

      <ResultRow
        label={RESULTS_LABELS.EATOUT_RATING}
        value={formatDecimal(results.avgRatings.eatOut)}
      />

      <ResultRow
        label={RESULTS_LABELS.TV_RATING}
        value={formatDecimal(results.avgRatings.tv)}
      />
    </div>
  );
}

export default Results;
