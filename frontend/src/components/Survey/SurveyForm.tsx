/**
 * SurveyForm Component
 *
 * Main survey form component for collecting user feedback. Handles:
 * - Personal details (name, email, contact, date of birth)
 * - Food preferences (multi-select checkboxes)
 * - Rating scale feedback (5-point scale: Strongly Agree → Strongly Disagree)
 *
 * Form validation is handled via React Hook Form with Zod schema validation.
 * All user inputs are sanitized and validated against the shared SurveySchema.
 *
 * @component
 * @returns {JSX.Element} Rendered survey form with all input fields and state management
 *
 * @example
 * import SurveyForm from '@/components/Survey/SurveyForm';
 *
 * export function App() {
 *   return <SurveyForm />;
 * }
 *
 * @dependencies
 * - React Hook Form: Form state management and validation
 * - Zod: Schema validation via zodResolver
 * - @/validation: SurveySchema for data validation
 * - @/services/api: submitSurvey for API communication
 * - @/components/ui: Reusable UI components (TextField, Loading, etc.)
 * - RatingRow: Rating input row component
 * - SurveyForm.constants: Centralized form labels and configuration
 * - SurveyForm.utils: Helper functions for form logic
 *
 * @throws {Error} If form submission fails (caught and displayed to user)
 *
 * @state {string|null} submitError - Error message from form submission
 * @state {FormState} formState - React Hook Form internal state (errors, isSubmitting, isSubmitSuccessful)
 *
 * @events
 * - onSubmit: Triggered when form is submitted with valid data
 * - handleClearError: Clears submission error state
 */

import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, memo, useEffect } from 'react';

import { SurveySchema } from '@/validation';
import type { SurveyFormValues } from '@/validation';
import { submitSurvey } from '@/services/api';
import { useErrorHandler } from '@/components/ErrorBoundary';
import { Loading, ErrorMessage, InlineError, TextField } from '@/components/ui';

import RatingRow from './RatingRow';
import styles from './SurveyForm.module.css';
import { FOOD_OPTIONS, RATING_SCALE_LABELS } from './SurveyForm.constants';
import { formatErrorMessage } from './SurveyForm.utils';

/**
 * SurveyForm component
 *
 * Renders the complete survey form with personal details, food preferences, and ratings.
 * Manages form state via React Hook Form and handles submission to the API.
 *
 * @returns {JSX.Element} The rendered form component
 */
function SurveyForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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

  /**
   * Handles form submission
   *
   * Validates form data and submits to API. On success, resets form state.
   * On error, displays error message and logs to error handler.
   *
   * @param {SurveyFormValues} data - Validated form data from React Hook Form
   * @returns {Promise<void>}
   * @throws {Error} API submission errors are caught and displayed to user
   */
  const onSubmit: SubmitHandler<SurveyFormValues> = useCallback(
    async (data) => {
      try {
        setSubmitError(null);
        await submitSurvey(data);
        // Form will be reset by useEffect when isSubmitSuccessful becomes true
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
    [handleError],
  );

  /**
   * Reset form immediately on successful submission
   *
   * CRITICAL FIX: Reset must happen synchronously after successful submission,
   * not in a delayed timeout. This ensures:
   * 1. React Hook Form's internal state is cleared immediately
   * 2. Radio buttons are properly unchecked (value="string" matches reset)
   * 3. Checkboxes are properly unchecked (array state cleared)
   * 4. All form fields are cleared before showing success message
   *
   * Without this fix:
   * - isSubmitSuccessful becomes true
   * - Success message shows WHILE form still has data
   * - Radio/checkboxes don't clear due to state-DOM desync
   * - Timeout delay makes timing unreliable
   */
  useEffect(() => {
    if (isSubmitSuccessful) {
      // Reset form immediately, not after delay
      reset();

      // Show success message
      setShowSuccessMessage(true);

      // Auto-dismiss success message after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitSuccessful, reset]);

  /**
   * Clears submission error state
   *
   * Called when user dismisses error message or retries submission.
   *
   * @returns {void}
   */
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
      {showSuccessMessage && (
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
          {showSuccessMessage && (
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
