// RatingRow.tsx
import React, { memo } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { SurveyFormValues } from '@/validation';
import { RATING_SCALE_LABELS } from './SurveyForm.constants';
import styles from './RatingRow.module.css';

interface RatingRowProps {
  label: string;
  fieldName: keyof SurveyFormValues;
  register: UseFormRegister<SurveyFormValues>;
  error?: string;
  isEvenRow?: boolean;
}

function RatingRow({
  label,
  fieldName,
  register,
  error,
  isEvenRow = false,
}: RatingRowProps) {
  const values = [1, 2, 3, 4, 5];

  return (
    <>
      <tr className={`${styles.row} ${isEvenRow ? styles.evenRow : ''}`}>
        <td className={styles.labelCell}>{label}</td>

        {values.map((value, idx) => {
          const id = `${String(fieldName)}-${value}`;
          return (
            <td key={value} className={styles.cell}>
              <label htmlFor={id} className={styles.cellLabel}>
                {RATING_SCALE_LABELS[idx]}
              </label>

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
            </td>
          );
        })}
      </tr>

      {error && (
        <tr className={styles.errorRow}>
          <td colSpan={6}>
            <div
              id={`${String(fieldName)}-error`}
              className={styles.errorContainer}
            >
              <span className={styles.errorText}>{error}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default memo(RatingRow);
