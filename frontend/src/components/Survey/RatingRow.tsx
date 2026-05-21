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
    <tr className={styles.ratingTableRow}>
      <td className={styles.statementCell}>{label}</td>
      {values.map((value) => {
        const id = `${String(fieldName)}-${value}`;
        return (
          <td key={value} className={styles.ratingCell}>
            <label className={styles.ratingOption}>
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
              <span className={styles.optionButton} aria-hidden="true" />
            </label>
          </td>
        );
      })}
    </tr>
  );
}

export default memo(RatingRow);
