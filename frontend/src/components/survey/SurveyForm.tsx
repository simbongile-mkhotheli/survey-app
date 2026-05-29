import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { ErrorMessage, Loading } from '@/components/ui';
import { useSubmitSurvey } from '@/hooks/useSubmitSurvey';
import { formatErrorMessage } from '@/utils/surveyErrors';
import { SurveySchema, type SurveyFormValues } from '@/validation';

import FoodPreferencesSection from './FoodPreferencesSection';
import PersonalDetailsSection from './PersonalDetailsSection';
import RatingPreferencesSection from './RatingPreferencesSection';
import styles from './SurveyForm.module.css';

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

export default function SurveyForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const successTimerRef = useRef<number | null>(null);
  const submitSurveyMutation = useSubmitSurvey();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
    reset,
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(SurveySchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues,
  });

  const clearSuccessTimer = useCallback(() => {
    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearSuccessTimer, [clearSuccessTimer]);

  const showTemporarySuccess = useCallback(() => {
    setShowSuccessMessage(true);
    clearSuccessTimer();
    successTimerRef.current = window.setTimeout(() => {
      setShowSuccessMessage(false);
      successTimerRef.current = null;
    }, 3000);
  }, [clearSuccessTimer]);

  const onSubmit: SubmitHandler<SurveyFormValues> = useCallback(
    async (data) => {
      try {
        setSubmitError(null);
        await submitSurveyMutation.mutateAsync(data);
        reset(defaultValues);
        showTemporarySuccess();
      } catch (err) {
        const errorMessage = formatErrorMessage(
          err instanceof Error ? err : new Error('Failed to submit survey'),
        );
        setSubmitError(errorMessage);
      }
    },
    [reset, showTemporarySuccess, submitSurveyMutation],
  );

  const handleRetry = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleClearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const isSubmitting = isFormSubmitting || submitSurveyMutation.isPending;

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
        <PersonalDetailsSection register={register} errors={errors} />
        <FoodPreferencesSection register={register} errors={errors} />
        <RatingPreferencesSection
          register={register}
          watch={watch}
          errors={errors}
        />

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
