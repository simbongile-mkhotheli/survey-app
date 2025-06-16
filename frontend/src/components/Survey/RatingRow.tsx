import type { UseFormRegister } from 'react-hook-form';
import styles from './RatingRow.module.css';
import type { SurveyFormValues } from '../../validation';

interface RatingRowProps {
  label: string;
  fieldName: keyof SurveyFormValues;
  register: UseFormRegister<SurveyFormValues>;
  error?: string;
  isEvenRow?: boolean;
}

export default function RatingRow({
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
        {[1, 2, 3, 4, 5].map((value) => (
          <td key={value} className={styles.cell}>
            <input
              type="radio"
              value={value}
              className={styles.radioInput}
              {...register(fieldName)}
            />
          </td>
        ))}
      </tr>

      {/* Always render this row to reserve space for error text */}
      <tr className={styles.errorRow}>
        <td colSpan={6}>
          <p className={styles.errorText}>{error ?? '\u00A0'}</p>
        </td>
      </tr>
    </>
  );
}
