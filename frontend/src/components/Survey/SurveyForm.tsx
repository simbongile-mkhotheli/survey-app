import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, memo } from 'react';

import { SurveySchema } from '@/validation';
import type { SurveyFormValues } from '@/validation';
import { submitSurvey } from '@/services/api';
import { useErrorHandler } from '@/components/ErrorBoundary';
import { Loading, ErrorMessage, InlineError, TextField } from '@/components/ui';

import RatingRow from './RatingRow';
import styles from './SurveyForm.module.css';

function SurveyForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { handleError } = useErrorHandler({ logToStore: false });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(SurveySchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit: SubmitHandler<SurveyFormValues> = useCallback(
    async (data) => {
      try {
        setSubmitError(null);
        await submitSurvey(data);
        reset();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to submit survey';
        setSubmitError(errorMessage);
        handleError(
          err instanceof Error ? err : new Error(errorMessage),
          'Survey submission',
        );
      }
    },
    [reset, handleError],
  );

  // Callback for clearing error state
  const handleClearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return (
    <div className={styles.page}>
      {/* Loading State */}
      {isSubmitting && <Loading text="Submitting survey..." overlay />}

      {/* Error State */}
      {submitError && (
        <ErrorMessage
          message={submitError}
          title="Submission Failed"
          severity="error"
          showRetry
          onRetry={handleClearError}
        />
      )}

      {/* Success State */}
      {isSubmitSuccessful && (
        <ErrorMessage
          message="Your survey has been submitted successfully! Thank you for your participation."
          title="Success!"
          severity="info"
        />
      )}

      {/* Personal Details */}
      <main className={styles.main}>
        <div className={styles.formCard}>
          <div className={styles.row}>
            <div className={styles.colLabel}>
              <span className={styles.labelText}>Personal Details</span>
            </div>
            <div className={styles.colInput}>
              <TextField<SurveyFormValues>
                id="firstName"
                label="First Name"
                type="text"
                placeholder="Enter first name"
                register={register}
                error={errors.firstName}
                required
                autoComplete="given-name"
              />

              <TextField<SurveyFormValues>
                id="lastName"
                label="Last Name"
                type="text"
                placeholder="Enter last name"
                register={register}
                error={errors.lastName}
                required
                autoComplete="family-name"
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
              />

              <TextField<SurveyFormValues>
                id="contactNumber"
                label="Contact Number"
                type="tel"
                placeholder="+1234567890"
                register={register}
                error={errors.contactNumber}
                required
                autoComplete="tel"
              />

              <TextField<SurveyFormValues>
                id="dateOfBirth"
                label="Date of Birth"
                type="date"
                register={register}
                error={errors.dateOfBirth}
                required
                autoComplete="bday"
              />
            </div>
          </div>

          {/* Favorite Foods */}
          <div className={styles.row}>
            <div className={styles.colFull}>
              <span className={styles.labelText}>
                What is your favorite food?
              </span>
              <div className={styles.checkboxGroup}>
                {['Pizza', 'Pasta', 'Pap and Wors', 'Other'].map((food) => (
                  <label key={food} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      value={food}
                      className={styles.checkbox}
                      {...register('foods')}
                    />{' '}
                    {food}
                  </label>
                ))}
              </div>
              <InlineError message={errors.foods?.message || ''} />
            </div>
          </div>

          {/* Rating Table */}
          <div className={styles.row}>
            <div className={styles.colFull}>
              <div className={styles.instruction}>
                Please rate your level of agreement on a scale from{' '}
                <strong>1 (Strongly Agree)</strong> to{' '}
                <strong>5 (Strongly Disagree)</strong>.
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.thLabel}></th>
                      <th className={styles.th}>Strongly Agree</th>
                      <th className={styles.th}>Agree</th>
                      <th className={styles.th}>Neutral</th>
                      <th className={styles.th}>Disagree</th>
                      <th className={styles.th}>Strongly Disagree</th>
                    </tr>
                  </thead>
                  <tbody>
                    <RatingRow
                      label="I like to watch movies"
                      fieldName="ratingMovies"
                      register={register}
                      error={errors.ratingMovies?.message}
                      isEvenRow
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
                      isEvenRow
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
            </div>
          </div>

          {/* Submit Button */}
          <div className={styles.submitContainer}>
            <button
              className={`${styles.submitButton} ${
                isSubmitting ? styles.submitButtonDisabled : ''
              }`}
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting…' : 'SUBMIT'}
            </button>
          </div>

          {/* Success Message */}
          {isSubmitSuccessful && (
            <div className={styles.successBanner}>
              Thank you for submitting!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default memo(SurveyForm);

SurveyForm.displayName = 'SurveyForm';
