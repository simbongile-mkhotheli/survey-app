import { memo } from 'react';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { SurveyFormValues } from '@/validation';
import { RATING_OPTIONS } from '@/constants/survey.constants';
import styles from './RatingRow.module.css';

interface RatingRowProps {
  label: string;
  fieldName: keyof SurveyFormValues;
  register: UseFormRegister<SurveyFormValues>;
  watch: UseFormWatch<SurveyFormValues>;
  error?: string;
}

function RatingRow({
  label,
  fieldName,
  register,
  watch,
  error,
}: RatingRowProps) {
  const errorId = `${String(fieldName)}-error`;
  const selectedValue = watch(fieldName);

  return (
    <tr className={styles.ratingTableRow}>
      <td className={styles.statementCell}>
        <span>{label}</span>
        {error && (
          <span id={errorId} className={styles.rowError}>
            {error}
          </span>
        )}
      </td>
      {RATING_OPTIONS.map((option) => {
        const id = `${String(fieldName)}-${option.value}`;
        return (
          <td key={option.value} className={styles.ratingCell}>
            <label className={styles.ratingOption}>
              <input
                id={id}
                type="radio"
                {...register(fieldName)}
                value={option.value}
                checked={selectedValue === option.value}
                className={styles.radioInput}
                aria-label={`${label}: ${option.label}`}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
              <span className={styles.optionButton} aria-hidden="true" />
              <span className={styles.mobileOptionLabel}>{option.value}</span>
            </label>
          </td>
        );
      })}
    </tr>
  );
}

export default memo(RatingRow);
