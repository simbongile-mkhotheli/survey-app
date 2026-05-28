import { RESULTS_LABELS } from '@/constants/results.constants';
import type { ResultsData } from '@/services/resultsService';
import { formatDecimal, formatPercentage } from '@/utils/numberFormatters';

import ResultRow from './ResultRow';
import styles from './Results.module.css';

interface ResultsMetricListProps {
  results: ResultsData;
}
export default function ResultsMetricList({ results }: ResultsMetricListProps) {
  const {
    foodPercentages: { pizza, pasta, papAndWors },
    avgRatings: { movies, radio, eatOut, tv },
  } = results;

  return (
    <>
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
        <ResultRow label={RESULTS_LABELS.TV_RATING} value={formatDecimal(tv)} />
      </div>
    </>
  );
}
