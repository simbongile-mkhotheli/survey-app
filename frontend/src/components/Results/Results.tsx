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
        severity="info"
      />
    );
  }

  const {
    totalCount,
    age: { avg, min, max },
    foodPercentages: { pizza, pasta, papAndWors },
    avgRatings: { movies, radio, eatOut, tv },
  } = results;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryTile}>
            <span className={styles.summaryLabel}>Total surveys</span>
            <strong className={styles.summaryValue}>{totalCount}</strong>
          </div>
          <div className={styles.summaryTile}>
            <span className={styles.summaryLabel}>Average age</span>
            <strong className={styles.summaryValue}>{formatAge(avg)}</strong>
          </div>
          <div className={styles.summaryTile}>
            <span className={styles.summaryLabel}>Oldest</span>
            <strong className={styles.summaryValue}>{formatAge(max)}</strong>
          </div>
          <div className={styles.summaryTile}>
            <span className={styles.summaryLabel}>Youngest</span>
            <strong className={styles.summaryValue}>{formatAge(min)}</strong>
          </div>
        </div>

        <div className={styles.sectionTitle}>{RESULTS_LABELS.HEADING}</div>

        <div className={styles.listBlock}>
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
        </div>

        <div className={styles.listBlock}>
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
          <ResultRow
            label={RESULTS_LABELS.TV_RATING}
            value={formatDecimal(tv)}
          />
        </div>
      </div>
    </div>
  );
}

export default Results;
