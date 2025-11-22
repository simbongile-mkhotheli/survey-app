/**
 * Form Utilities (Frontend)
 * =========================
 * Common form data transformation and validation helpers
 */

import { dateUtils } from './dateUtils';

/**
 * Convert form input dates (YYYY-MM-DD strings) to ISO datetime
 *
 * @param dateString Date in format YYYY-MM-DD
 * @returns ISO 8601 datetime string
 *
 * @example
 * formDateToISO('2025-11-22') // '2025-11-22T00:00:00.000Z'
 */
export function formDateToISO(dateString: string): string {
  const date = dateUtils.parse(dateString);
  return dateUtils.formatDatetime(date);
}

/**
 * Convert ISO datetime to form input date format
 *
 * @param isoString ISO 8601 datetime string
 * @returns Date in format YYYY-MM-DD
 *
 * @example
 * isoToFormDate('2025-11-22T10:30:00Z') // '2025-11-22'
 */
export function isoToFormDate(isoString: string): string {
  return dateUtils.format(isoString);
}

/**
 * Trim and normalize whitespace in object values
 *
 * @param obj Object with string values
 * @returns Object with trimmed values
 *
 * @example
 * trimObjectValues({ name: '  John  ', email: '  test@example.com  ' })
 * // { name: 'John', email: 'test@example.com' }
 */
export function trimObjectValues<T extends Record<string, unknown>>(obj: T): T {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key as keyof T] = (
      typeof value === 'string' ? value.trim() : value
    ) as T[keyof T];
    return acc;
  }, {} as T);
}

/**
 * Convert form values to lowercase where applicable
 *
 * @param obj Object with values
 * @param fields Fields to convert to lowercase
 * @returns Object with specified fields lowercased
 *
 * @example
 * toLowercase({ email: 'TEST@EXAMPLE.COM', name: 'John' }, ['email'])
 * // { email: 'test@example.com', name: 'John' }
 */
export function toLowercase<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): T {
  return fields.reduce(
    (acc, field) => {
      const value = acc[field];
      acc[field] = (
        typeof value === 'string' ? value.toLowerCase() : value
      ) as T[keyof T];
      return acc;
    },
    { ...obj },
  );
}

/**
 * Sanitize string by removing potential XSS vectors
 *
 * @param input String to sanitize
 * @returns Sanitized string
 *
 * @example
 * sanitizeString('<script>alert("xss")</script>') // removes dangerous content
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Sanitize all string fields in object
 *
 * @param obj Object to sanitize
 * @returns Object with sanitized string fields
 *
 * @example
 * sanitizeObject({ name: '<script>test</script>', age: 25 })
 * // { name: 'test', age: 25 }
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key as keyof T] = (
      typeof value === 'string' ? sanitizeString(value) : value
    ) as T[keyof T];
    return acc;
  }, {} as T);
}

/**
 * Extract changed fields between two objects
 *
 * @param original Original object
 * @param updated Updated object
 * @returns Object containing only changed fields
 *
 * @example
 * getChangedFields({ name: 'John', age: 25 }, { name: 'John', age: 30 })
 * // { age: 30 }
 */
export function getChangedFields<T extends Record<string, unknown>>(
  original: T,
  updated: T,
): Partial<T> {
  return Object.entries(updated).reduce((acc, [key, value]) => {
    if (original[key as keyof T] !== value) {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Check if object has any values
 *
 * @param obj Object to check
 * @returns True if object has at least one non-null/non-undefined value
 *
 * @example
 * hasValues({ name: 'John', email: '' }) // true
 * hasValues({ name: '', email: null }) // false
 */
export function hasValues(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(
    (value) => value !== null && value !== undefined && value !== '',
  );
}

/**
 * Form utilities object for convenient access
 * @example
 * formUtils.trimValues(data)
 * formUtils.sanitize(data)
 */
export const formUtils = {
  dateToISO: formDateToISO,
  isoToDate: isoToFormDate,
  trimValues: trimObjectValues,
  toLowercase,
  sanitize: sanitizeString,
  sanitizeObject,
  getChanged: getChangedFields,
  hasValues,
};
