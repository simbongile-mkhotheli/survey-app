import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { StarIcon } from '@/components/icons';
import { RATING_FIELDS, RATING_OPTIONS } from '@/constants/survey.constants';
import type { SurveyFormValues } from '@/validation';

import RatingRow from './RatingRow';
import styles from './SurveyForm.module.css';

interface RatingPreferencesSectionProps {
  register: UseFormRegister<SurveyFormValues>;
  errors: FieldErrors<SurveyFormValues>;
}
export default function RatingPreferencesSection({
  register,
  errors,
}: RatingPreferencesSectionProps) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeaderCompact}>
        <div className={styles.sectionIcon} aria-hidden="true">
          <StarIcon className={styles.sectionIconSvg} />
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Rate Your Preferences</h2>
          <p className={styles.sectionSubtitle}>
            Please rate your level of agreement on a scale from 1 (Strongly
            Disagree) to 5 (Strongly Agree).
          </p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.ratingTable}>
          <thead>
            <tr>
              <th className={styles.headLabel}>
                <div>Statement</div>
              </th>
              {RATING_OPTIONS.map((option) => (
                <th key={option.value} className={styles.headCell}>
                  <span>{option.label}</span>
                  <small>{option.value}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATING_FIELDS.map(({ label, fieldName }) => (
              <RatingRow
                key={fieldName}
                label={label}
                fieldName={fieldName}
                register={register}
                error={errors[fieldName]?.message}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
