import type { ResultsData } from '@/services/resultsService';
import { formatAge } from '@/utils/numberFormatters';

import styles from './Results.module.css';

interface ResultsSummaryProps {
  results: ResultsData;
}
export default function ResultsSummary({ results }: ResultsSummaryProps) {
  const {
    totalCount,
    age: { avg, min, max },
  } = results;

  return (
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
  );
}
