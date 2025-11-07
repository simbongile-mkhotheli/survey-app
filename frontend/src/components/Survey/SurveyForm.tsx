import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import { SurveySchema } from '@/validation';
import type { SurveyFormValues } from '@/validation';
import { submitSurvey } from '@/services/api';
import { useErrorHandler } from '@/components/ErrorBoundary';
import { Loading, ErrorMessage, InlineError } from '@/components/ui';

import RatingRow from './RatingRow';
import styles from './SurveyForm.module.css';

export default function SurveyForm() {
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

  const onSubmit: SubmitHandler<SurveyFormValues> = async (data) => {
    try {
      setSubmitError(null);
      await submitSurvey(data);
      reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit survey';
      setSubmitError(errorMessage);
      handleError(err instanceof Error ? err : new Error(errorMessage), 'Survey submission');
    }
  };

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
          onRetry={() => setSubmitError(null)}
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
        <div className={styles.row}>
          <div className={styles.colLabel}>
            <span className={styles.labelText}>Personal Details :</span>
          </div>
          <div className={styles.colInput}>
            <div className={styles.fieldGroup}>
              <label htmlFor="firstName" className={styles.fieldLabel}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                className={`${styles.textbox} ${
                  errors.firstName ? styles.textboxError : ''
                }`}
                {...register('firstName')}
              />
              <InlineError message={errors.firstName?.message || ''} />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="lastName" className={styles.fieldLabel}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                className={`${styles.textbox} ${
                  errors.lastName ? styles.textboxError : ''
                }`}
                {...register('lastName')}
              />
              <p className={styles.errorText}>
                {errors.lastName?.message ?? '\u00A0'}
              </p>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.fieldLabel}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`${styles.textbox} ${
                  errors.email ? styles.textboxError : ''
                }`}
                {...register('email')}
              />
              <p className={styles.errorText}>
                {errors.email?.message ?? '\u00A0'}
              </p>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="contactNumber" className={styles.fieldLabel}>
                Contact Number
              </label>
              <input
                id="contactNumber"
                type="tel"
                placeholder="+1234567890"
                className={`${styles.textbox} ${
                  errors.contactNumber ? styles.textboxError : ''
                }`}
                {...register('contactNumber')}
              />
              <p className={styles.errorText}>
                {errors.contactNumber?.message ?? '\u00A0'}
              </p>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="dateOfBirth" className={styles.fieldLabel}>
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                className={`${styles.textbox} ${
                  errors.dateOfBirth ? styles.textboxError : ''
                }`}
                {...register('dateOfBirth')}
              />
              <p className={styles.errorText}>
                {errors.dateOfBirth?.message ?? '\u00A0'}
              </p>
            </div>
          </div>
        </div>

        {/* Favorite Foods */}
        <div className={styles.row} style={{ marginTop: 20 }}>
          <div className={styles.colLabel}>
            <span className={styles.labelText}>
              What is your favorite food?
            </span>
          </div>
          <div className={styles.colInputInline}>
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
            <p className={styles.errorText} style={{ marginTop: '8px' }}>
              {errors.foods?.message ?? '\u00A0'}
            </p>
          </div>
        </div>

        {/* Rating Table */}
        <div className={styles.row} style={{ marginTop: 20 }}>
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
          <div className={styles.successBanner}>Thank you for submitting!</div>
        )}
      </main>
    </div>
  );
}
