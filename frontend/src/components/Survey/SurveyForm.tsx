import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  CalendarIcon,
  ForkIcon,
  MailIcon,
  PhoneIcon,
  StarIcon,
  UserIcon,
} from '@/components/icons';
import { ErrorMessage, InlineError, Loading, TextField } from '@/components/ui';
import { submitSurvey } from '@/services/api';
import { SurveySchema, type SurveyFormValues } from '@/validation';

import RatingRow from './RatingRow';
import { FOOD_OPTIONS, RATING_OPTIONS } from './SurveyForm.constants';
import styles from './SurveyForm.module.css';
import { formatErrorMessage } from './SurveyForm.utils';

const defaultValues: SurveyFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  dateOfBirth: '',
  foods: [],
  ratingMovies: '',
  ratingRadio: '',
  ratingEatOut: '',
  ratingTV: '',
};

const foodBadge = (food: string) => {
  if (food === 'Pizza') return '🍕';
  if (food === 'Pasta') return '🍝';
  if (food === 'Pap and Wors') return '🍖';
  return '...';
};

export default function SurveyForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const successTimerRef = useRef<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(SurveySchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues,
  });

  const clearSuccessTimer = () => {
    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  useEffect(() => () => clearSuccessTimer(), []);

  const resetToDefaults = useCallback(() => {
    reset(defaultValues);
  }, [reset]);

  const onSubmit: SubmitHandler<SurveyFormValues> = useCallback(
    async (data) => {
      try {
        setSubmitError(null);
        await submitSurvey(data);
        resetToDefaults();

        setShowSuccessMessage(true);
        clearSuccessTimer();
        successTimerRef.current = window.setTimeout(() => {
          setShowSuccessMessage(false);
          successTimerRef.current = null;
        }, 3000);
      } catch (err) {
        const errorMessage = formatErrorMessage(
          err instanceof Error ? err : new Error('Failed to submit survey'),
        );
        setSubmitError(errorMessage);
      }
    },
    [resetToDefaults],
  );

  const handleRetry = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleClearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return (
    <div className={styles.page}>
      {isSubmitting && <Loading text="Submitting survey..." overlay />}

      {submitError && (
        <div className={styles.alertWrap}>
          <ErrorMessage
            message={submitError}
            title="Submission Failed"
            severity="error"
            showRetry
            onRetry={handleRetry}
            onClose={handleClearError}
          />
        </div>
      )}

      {showSuccessMessage && (
        <div className={styles.alertWrap}>
          <ErrorMessage
            message="Your survey has been submitted successfully. Thank you for your participation."
            title="Success"
            severity="success"
            onClose={() => setShowSuccessMessage(false)}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={styles.form}
      >
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon} aria-hidden="true">
              <UserIcon className={styles.sectionIconSvg} />
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Personal Details</h2>
              <p className={styles.sectionSubtitle}>
                Please provide your basic information.
              </p>
            </div>
          </div>

          <div className={styles.fieldGridTwo}>
            <TextField<SurveyFormValues>
              id="firstName"
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              register={register}
              error={errors.firstName}
              required
              autoComplete="given-name"
              icon={<UserIcon />}
            />

            <TextField<SurveyFormValues>
              id="lastName"
              label="Last Name"
              type="text"
              placeholder="Enter your last name"
              register={register}
              error={errors.lastName}
              required
              autoComplete="family-name"
              icon={<UserIcon />}
            />

            <TextField<SurveyFormValues>
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              register={register}
              error={errors.email}
              required
              autoComplete="email"
              icon={<MailIcon />}
            />

            <TextField<SurveyFormValues>
              id="contactNumber"
              label="Contact Number"
              type="tel"
              placeholder="+1 (234) 567-8900"
              register={register}
              error={errors.contactNumber}
              required
              autoComplete="tel"
              icon={<PhoneIcon />}
            />

            <TextField<SurveyFormValues>
              id="dateOfBirth"
              label="Date of Birth"
              type="date"
              register={register}
              error={errors.dateOfBirth}
              required
              autoComplete="bday"
              icon={<CalendarIcon />}
            />
          </div>
        </section>

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

          <div className={styles.questionTitle}>
            What is your favorite food?
          </div>

          <div className={styles.choiceGrid}>
            {FOOD_OPTIONS.map((food) => (
              <label key={food} className={styles.choiceCard}>
                <span className={styles.choiceEmoji} aria-hidden="true">
                  {foodBadge(food)}
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
                <RatingRow
                  label="I like to watch movies"
                  fieldName="ratingMovies"
                  register={register}
                  error={errors.ratingMovies?.message}
                />
                <RatingRow
                  label="I like to listen to radio"
                  fieldName="ratingRadio"
                  register={register}
                  error={errors.ratingRadio?.message}
                />
                <RatingRow
                  label="I like to eat out"
                  fieldName="ratingEatOut"
                  register={register}
                  error={errors.ratingEatOut?.message}
                />
                <RatingRow
                  label="I like to watch TV"
                  fieldName="ratingTV"
                  register={register}
                  error={errors.ratingTV?.message}
                />
              </tbody>
            </table>
          </div>
        </section>

        <div className={styles.submitWrap}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
