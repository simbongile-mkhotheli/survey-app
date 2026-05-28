import styles from './Results.module.css';

interface ResultRowProps {
  label: string;
  value: string | number;
}
export default function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className={styles.resultRow}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
