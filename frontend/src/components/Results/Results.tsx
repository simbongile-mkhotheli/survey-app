import { useEffect, useState } from 'react';
import { fetchResults } from '../../services/api';
import type { ResultsData } from '../../services/api';
import { useSurveyStore } from '../../store/useSurveyStore';
import styles from './Results.module.css';

export default function Results() {
  // read from Zustand store
  const results = useSurveyStore((s) => s.results);
  const setResults = useSurveyStore((s) => s.setResults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults()
      .then((res: ResultsData) => {
        setResults(res);
      })
      .catch((err) => {
        console.error(err);
        setResults(null);
      })
      .finally(() => setLoading(false));
  }, [setResults]);

  if (loading) {
    return <p>Loading results...</p>;
  }

  if (!results) {
    return <p style={{ color: 'red' }}>Error loading data.</p>;
  }

  if (results.totalCount === 0) {
    return <p>No Surveys Available.</p>;
  }

  const {
    totalCount,
    age: { avg, min, max },
    foodPercentages: { pizza, pasta, papAndWors },
    avgRatings: { movies, radio, eatOut, tv },
  } = results;

  const fmtDecimal = (n: number | string | null) => {
    if (n == null) return 'N/A';
    const num = Number(n);
    return isNaN(num) ? 'N/A' : num.toFixed(1);
  };

  const fmtInt = (n: number | string | null) => {
    if (n == null) return 'N/A';
    const num = Number(n);
    return isNaN(num) ? 'N/A' : Math.round(num).toString();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Survey Results</h2>

      <div className={styles.resultRow}>
        <span className={styles.label}>Total number of surveys :</span>
        <span className={styles.value}>{totalCount}</span>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.label}>Average Age :</span>
        <span className={styles.value}>{fmtDecimal(avg)}</span>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.label}>
          Oldest person who participated in survey :
        </span>
        <span className={styles.value}>{fmtInt(max)}</span>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.label}>
          Youngest person who participated in survey :
        </span>
        <span className={styles.value}>{fmtInt(min)}</span>
      </div>

      <div style={{ height: '1rem' }} />

      <div className={styles.resultRow}>
        <span className={styles.label}>Percentage who like Pizza :</span>
        <span className={styles.value}>{fmtDecimal(pizza)}%</span>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.label}>Percentage who like Pasta :</span>
        <span className={styles.value}>{fmtDecimal(pasta)}%</span>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.label}>Percentage who like Pap and Wors :</span>
        <span className={styles.value}>{fmtDecimal(papAndWors)}%</span>
      </div>

      <div style={{ height: '1rem' }} />

      <div className={styles.resultRow}>
        <span className={styles.label}>I like to watch movies :</span>
        <span className={styles.value}>{fmtDecimal(movies)}</span>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.label}>I like to listen to radio :</span>
        <span className={styles.value}>{fmtDecimal(radio)}</span>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.label}>I like to eat out :</span>
        <span className={styles.value}>{fmtDecimal(eatOut)}</span>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.label}>I like to watch TV :</span>
        <span className={styles.value}>{fmtDecimal(tv)}</span>
      </div>
    </div>
  );
}
