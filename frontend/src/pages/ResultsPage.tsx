import ResultsMetricList from '@/components/results/ResultsMetricList';
import ResultsSummary from '@/components/results/ResultsSummary';
import { ErrorMessage, Loading } from '@/components/ui';
import {
  RESULTS_EMPTY,
  RESULTS_ERROR,
  RESULTS_LABELS,
  RESULTS_LOADING,
} from '@/constants/results.constants';
import { useResults } from '@/hooks/useResults';

import styles from '@/components/results/Results.module.css';

export default function ResultsPage() {
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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <ResultsSummary results={results} />
        <div className={styles.sectionTitle}>{RESULTS_LABELS.HEADING}</div>
        <ResultsMetricList results={results} />
      </div>
    </div>
  );
}
