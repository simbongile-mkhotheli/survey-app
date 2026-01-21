// SurveyForm.tsx
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { SurveySchema } from '@/validation';
import type { SurveyFormValues } from '@/validation';
import { submitSurvey } from '@/services/api';
import { useErrorHandler } from '@/components/ErrorBoundary';
import { Loading, ErrorMessage, InlineError, TextField } from '@/components/ui';

import RatingRow from './RatingRow';
import styles from './SurveyForm.module.css';
import { FOOD_OPTIONS, RATING_SCALE_LABELS } from './SurveyForm.constants';
import { formatErrorMessage } from './SurveyForm.utils';

function SurveyFormInner() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { handleError } = useErrorHandler({ logToStore: false });
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
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      dateOfBirth: '',
      foods: [],
      ratingMovies: undefined,
      ratingRadio: undefined,
      ratingEatOut: undefined,
      ratingTV: undefined,
    },
  });

  const clearSuccessTimer = () => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  useEffect(() => {
    // cleanup on unmount
    return () => {
      clearSuccessTimer();
    };
  }, []);

  const onSubmit: SubmitHandler<SurveyFormValues> = useCallback(
    async (data) => {
      try {
        setSubmitError(null);

        await submitSurvey(data);

        // Synchronous reset — clears RHF internal state and avoids DOM desync
        reset({
          firstName: '',
          lastName: '',
          email: '',
          contactNumber: '',
          dateOfBirth: '',
          foods: [],
          ratingMovies: undefined,
          ratingRadio: undefined,
          ratingEatOut: undefined,
          ratingTV: undefined,
        });

        setShowSuccessMessage(true);

        // Auto-dismiss success message after 3s (track timer for cleanup)
        clearSuccessTimer();
        // window.setTimeout returns number in browsers
        successTimerRef.current = window.setTimeout(() => {
          setShowSuccessMessage(false);
          successTimerRef.current = null;
        }, 3000);
      } catch (err) {
        const errorMessage = formatErrorMessage(
          err instanceof Error ? err : new Error('Failed to submit survey'),
        );
        setSubmitError(errorMessage);
        handleError(
          err instanceof Error ? err : new Error(errorMessage),
          'Survey submission',
        );
      }
    },
    [handleError, reset],
  );

  // Retries submission using current form values (runs validation first)
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
        <ErrorMessage
          message={submitError}
          title="Submission Failed"
          severity="error"
          showRetry
          onRetry={handleRetry}
          onClose={handleClearError}
        />
      )}

      <main className={styles.main}>
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                  {FOOD_OPTIONS.map((food) => (
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
                        {RATING_SCALE_LABELS.map((label) => (
                          <th key={label} className={styles.th}>
                            {label}
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

            <div className={styles.submitContainer}>
              <button
                type="submit"
                className={`${styles.submitButton} ${isSubmitting ? styles.submitButtonDisabled : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting…' : 'SUBMIT'}
              </button>
            </div>
          </form>

          {showSuccessMessage && (
            <ErrorMessage
              message="Your survey has been submitted successfully! Thank you for your participation."
              title="Success!"
              severity="success"
              onClose={() => setShowSuccessMessage(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// export memoized component and set displayName on the memoized value
const SurveyForm = memo(SurveyFormInner);
SurveyForm.displayName = 'SurveyForm';
export default SurveyForm;
