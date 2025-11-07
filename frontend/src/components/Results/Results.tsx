import { useEffect, useMemo, useRef } from 'react';
import { useResults } from '@/store/useSurveyStore';
import { Loading, ErrorMessage } from '@/components/ui';
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
  const { data: results, loading, error, fetchResults } = useResults();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Fetch results if not already loaded and not already fetching
    if (!results && !loading && !error && !hasFetched.current) {
      hasFetched.current = true;
      fetchResults();
    }
  }, [results, loading, error]); // Remove fetchResults from dependencies
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
    return <Loading text="Loading survey results..." />;
  }
  
  if (error) {
    return (
      <ErrorMessage 
        message={error}
        title="Failed to Load Results"
        showRetry
        onRetry={fetchResults}
      />
    );
  }

  if (!results || results.totalCount === 0) {
    return (
      <ErrorMessage 
        message="No survey responses available yet. Be the first to submit a survey!"
        title="No Data"
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
  <h2 className={styles.heading}><span aria-hidden="true">📊 </span><span>Survey Results</span></h2>
        
        <ResultRow label="Total number of surveys" value={totalCount} />
        <ResultRow label="Average Age" value={`${fmtDecimal(avg)} years`} />
        <ResultRow
          label="Oldest person who participated"
          value={`${fmtInt(max)} years`}
        />
        <ResultRow
          label="Youngest person who participated"
          value={`${fmtInt(min)} years`}
        />
        
        <div style={{ height: '2rem' }} />
        
        <ResultRow
          label="🍕 Percentage who like Pizza"
          value={`${fmtDecimal(pizza)}%`}
        />
        <ResultRow
          label="🍝 Percentage who like Pasta"
          value={`${fmtDecimal(pasta)}%`}
        />
        <ResultRow
          label="🍖 Percentage who like Pap and Wors"
          value={`${fmtDecimal(papAndWors)}%`}
        />
        
        <div style={{ height: '2rem' }} />
        
        <ResultRow label="🎬 I like to watch movies" value={fmtDecimal(movies)} />
        <ResultRow label="📻 I like to listen to radio" value={fmtDecimal(radio)} />
        <ResultRow label="🍽️ I like to eat out" value={fmtDecimal(eatOut)} />
        <ResultRow label="📺 I like to watch TV" value={fmtDecimal(tv)} />
      </div>
    </div>
  );
}
