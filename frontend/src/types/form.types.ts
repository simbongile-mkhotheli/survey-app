/**
 * Common Type Definitions
 * ======================
 * Shared TypeScript types and interfaces for form components
 */

import type { UseFormRegister, FieldError, FieldErrors, FieldValues } from 'react-hook-form';

/**
 * Standard props for controlled form inputs
 */
export interface BaseInputProps {
  id: string;
  label: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Props for text-based inputs
 */
export interface TextInputProps extends BaseInputProps {
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
export interface SelectInputProps extends BaseInputProps {
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

/**
 * Props for checkbox/radio group inputs
 */
export interface CheckboxGroupProps extends Omit<BaseInputProps, 'register'> {
  options: Array<{ value: string; label: string }>;
  register: UseFormRegister<any>;
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
