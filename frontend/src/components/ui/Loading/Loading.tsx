import styles from './Loading.module.css';

export interface LoadingProps {
  text?: string;
  overlay?: boolean;
}

export function Loading({
  text = 'Loading...',
  overlay = false,
}: LoadingProps) {
  return (
    <div className={overlay ? styles.overlayContainer : styles.container}>
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
