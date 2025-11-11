/**
 * Common Type Definitions
 * ======================
 * Shared TypeScript types and interfaces for form components
 */

import type {
  UseFormRegister,
  FieldError,
  FieldErrors,
  FieldValues,
} from 'react-hook-form';

/**
 * Standard props for controlled form inputs
 */
export interface BaseInputProps<T extends FieldValues = FieldValues> {
  id: string;
  label: string;
  register: UseFormRegister<T>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Props for text-based inputs
 */
export interface TextInputProps<T extends FieldValues = FieldValues>
  extends BaseInputProps<T> {
  type?: 'text' | 'email' | 'tel' | 'date' | 'password' | 'url' | 'number';
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

/**
 * Props for select/dropdown inputs
 */
export interface SelectInputProps<T extends FieldValues = FieldValues>
  extends BaseInputProps<T> {
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

/**
 * Props for checkbox/radio group inputs
 */
export interface CheckboxGroupProps<T extends FieldValues = FieldValues>
  extends Omit<BaseInputProps<T>, 'register'> {
  options: Array<{ value: string; label: string }>;
  register: UseFormRegister<T>;
}

/**
 * Form state helper types
 */
export type FormErrors<T extends FieldValues> = FieldErrors<T>;

export interface FormConfig {
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit';
  shouldFocusError?: boolean;
}
