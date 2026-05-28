import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { ForkIcon } from '@/components/icons';
import { InlineError } from '@/components/ui';
import { FOOD_BADGES, FOOD_OPTIONS } from '@/constants/survey.constants';
import type { SurveyFormValues } from '@/validation';

import styles from './SurveyForm.module.css';

interface FoodPreferencesSectionProps {
  register: UseFormRegister<SurveyFormValues>;
  errors: FieldErrors<SurveyFormValues>;
}
export default function FoodPreferencesSection({
  register,
  errors,
}: FoodPreferencesSectionProps) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeaderCompact}>
        <div className={styles.sectionIcon} aria-hidden="true">
          <ForkIcon className={styles.sectionIconSvg} />
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Preferences</h2>
          <p className={styles.sectionSubtitle}>
            Tell us about your favorites.
          </p>
        </div>
      </div>

      <div className={styles.questionTitle}>What is your favorite food?</div>

      <div className={styles.choiceGrid}>
        {FOOD_OPTIONS.map((food) => (
          <label key={food} className={styles.choiceCard}>
            <span className={styles.choiceEmoji} aria-hidden="true">
              {FOOD_BADGES[food]}
            </span>
            <span className={styles.choiceLabel}>{food}</span>
            <input
              type="checkbox"
              value={food}
              className={styles.choiceInput}
              {...register('foods')}
            />
            <span className={styles.choiceBox} aria-hidden="true" />
          </label>
        ))}
      </div>
      <InlineError message={errors.foods?.message || ''} />
    </section>
  );
}
