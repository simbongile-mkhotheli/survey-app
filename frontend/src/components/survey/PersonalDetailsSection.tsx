import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import {
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from '@/components/icons';
import { TextField } from '@/components/ui';
import type { SurveyFormValues } from '@/validation';

import styles from './SurveyForm.module.css';

interface PersonalDetailsSectionProps {
  register: UseFormRegister<SurveyFormValues>;
  errors: FieldErrors<SurveyFormValues>;
}
export default function PersonalDetailsSection({
  register,
  errors,
}: PersonalDetailsSectionProps) {
  return (
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
          placeholder="+1234567890"
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
  );
}
