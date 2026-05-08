import { memo } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { SurveyFormValues } from '@/validation';
import styles from './RatingRow.module.css';

interface RatingRowProps {
  label: string;
  fieldName: keyof SurveyFormValues;
  register: UseFormRegister<SurveyFormValues>;
  error?: string;
}

function RatingRow({ label, fieldName, register, error }: RatingRowProps) {
  const values = [5, 4, 3, 2, 1];

  return (
    <div className={styles.ratingCard}>
      <div className={styles.statementLabel}>{label}</div>
      <div className={styles.ratingOptions}>
        {values.map((value) => {
          const id = `${String(fieldName)}-${value}`;
          return (
            <label key={value} className={styles.ratingOption}>
              <input
                id={id}
                type="radio"
                {...register(fieldName, { setValueAs: (v) => Number(v) })}
                value={String(value)}
                className={styles.radioInput}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error ? `${String(fieldName)}-error` : undefined
                }
              />
              <span className={styles.optionButton} aria-hidden="true">
                {value}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <div id={`${String(fieldName)}-error`} className={styles.errorText}>
          {error}
        </div>
      )}
    </div>
  );
}

export default memo(RatingRow);
