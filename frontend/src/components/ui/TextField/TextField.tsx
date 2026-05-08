import type {
  UseFormRegister,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';
import type { ReactNode } from 'react';
import { InlineError } from '@/components/ui';
import styles from './TextField.module.css';

interface TextFieldProps<T extends FieldValues = FieldValues> {
  id: Path<T>;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'password' | 'url';
  placeholder?: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  required?: boolean;
  autoComplete?: string;
  icon?: ReactNode;
}

export default function TextField<T extends FieldValues = FieldValues>({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  error,
  required = false,
  autoComplete,
  icon,
}: TextFieldProps<T>) {
  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <div
        className={`${styles.inputShell} ${error ? styles.inputShellError : ''}`}
      >
        {icon && <span className={styles.leadingIcon}>{icon}</span>}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={styles.textbox}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(id)}
        />
      </div>

      <InlineError message={error?.message || ''} id={`${id}-error`} />
    </div>
  );
}
