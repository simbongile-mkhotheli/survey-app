import { useEffect, useState, useMemo } from 'react';
import { fetchResults } from '../../services/api';
import { useSurveyStore } from '../../store/useSurveyStore';
import styles from './Results.module.css';
// Utility functions moved outside component
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
// Separate components for better organization
const ResultRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className={styles.resultRow}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{value}</span>
  </div>
);
export default function Results() {
  const results = useSurveyStore((s) => s.results);
  const setResults = useSurveyStore((s) => s.setResults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchResults();
        setResults(res);
      } catch (err) {
        console.error(err);
        setError('Failed to load survey results');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setResults]);
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
  if (loading) {
    return <div className={styles.message}>Loading results...</div>;
  }
  if (error || !results) {
    return <div className={styles.error}>{error || 'Error loading data.'}</div>;
  }
  if (results.totalCount === 0) {
    return <div className={styles.message}>No Surveys Available.</div>;
  }
  const {
    totalCount,
    age: { avg, min, max },
    foodPercentages: { pizza, pasta, papAndWors },
    avgRatings: { movies, radio, eatOut, tv },
  } = resultValues!;
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Survey Results</h2>
      <ResultRow label="Total number of surveys" value={totalCount} />
      <ResultRow label="Average Age" value={`${fmtDecimal(avg)}`} />
      <ResultRow
        label="Oldest person who participated in survey"
        value={`${fmtInt(max)}`}
      />
      <ResultRow
        label="Youngest person who participated in survey"
        value={`${fmtInt(min)}`}
      />
      <div style={{ height: '1rem' }} />
      <ResultRow
        label="Percentage who like Pizza"
        value={`${fmtDecimal(pizza)}%`}
      />
      <ResultRow
        label="Percentage who like Pasta"
        value={`${fmtDecimal(pasta)}%`}
      />
      <ResultRow
        label="Percentage who like Pap and Wors"
        value={`${fmtDecimal(papAndWors)}%`}
      />
      <div style={{ height: '1rem' }} />
      <ResultRow label="I like to watch movies" value={fmtDecimal(movies)} />
      <ResultRow label="I like to listen to radio" value={fmtDecimal(radio)} />
      <ResultRow label="I like to eat out" value={fmtDecimal(eatOut)} />
      <ResultRow label="I like to watch TV" value={fmtDecimal(tv)} />
    </div>
  );
}
