import { memo } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { InputHTMLAttributes } from 'react';
import styles from './RatingRow.module.css';
import type { SurveyFormValues } from '@/validation';
import { RATING_SCALE_LABELS } from './SurveyForm.constants';

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
  return (
    <>
      <tr className={`${styles.row} ${isEvenRow ? styles.evenRow : ''}`}>
        <td className={styles.labelCell}>{label}</td>
        <div className={styles.optionsContainer}>
          {[1, 2, 3, 4, 5].map((value, index) => (
            <td key={value} className={styles.cell}>
              <span className={styles.cellLabel}>
                {RATING_SCALE_LABELS[index]}
              </span>
              <input
                type="radio"
                value={value}
                className={styles.radioInput}
                {...(register(
                  fieldName,
                ) as unknown as InputHTMLAttributes<HTMLInputElement>)}
              />
            </td>
          ))}
        </div>
      </tr>

      {/* Only render error row if there's an error */}
      {error && (
        <tr className={styles.errorRow}>
          <td colSpan={6}>
            <div className={styles.errorContainer}>
              <span className={styles.errorIcon}>⚠️</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default memo(RatingRow);
