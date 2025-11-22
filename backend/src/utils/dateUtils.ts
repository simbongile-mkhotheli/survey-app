/**
 * Date Formatting Utilities
 * ==========================
 * Centralizes date formatting logic to prevent duplication
 * All dates use ISO 8601 format (UTC)
 */

/**
 * Format a date to ISO 8601 date string (YYYY-MM-DD)
 * Removes time component for cleaner date display
 *
 * @param date Date object or ISO string to format
 * @returns ISO date string (YYYY-MM-DD)
 *
 * @example
 * formatDate(new Date('2025-11-22')) // '2025-11-22'
 * formatDate('2025-11-22T10:30:00Z') // '2025-11-22'
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Parse date string to Date object (handles various formats)
 *
 * @param dateString Date string to parse
 * @returns Date object in UTC
 *
 * @example
 * parseDate('2025-11-22') // Date object
 * parseDate('2025-11-22T10:30:00Z') // Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format date to ISO 8601 datetime string (full timestamp)
 *
 * @param date Date object or ISO string
 * @returns ISO 8601 timestamp
 *
 * @example
 * formatDatetime(new Date()) // '2025-11-22T10:30:00.123Z'
 */
export function formatDatetime(date: Date | string): string {
  return new Date(date).toISOString();
}

/**
 * Calculate age from date of birth
 * Used for validation and data aggregation
 *
 * @param dateOfBirth Date of birth string or Date object
 * @returns Age in years
 *
 * @example
 * calculateAge('2000-01-15'); // Result: 25
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get time elapsed in milliseconds between two dates
 *
 * @param startDate Start date
 * @param endDate End date (defaults to now)
 * @returns Elapsed time in milliseconds
 *
 * @example
 * getElapsedTime('2025-11-22T10:00:00Z') // milliseconds since then
 */
export function getElapsedTime(
  startDate: Date | string,
  endDate: Date | string = new Date(),
): number {
  return new Date(endDate).getTime() - new Date(startDate).getTime();
}

/**
 * Date utilities object for convenient access
 * @example
 * dateUtils.formatDate(date)
 * dateUtils.calculateAge(birthDate)
 */
export const dateUtils = {
  format: formatDate,
  formatDatetime,
  parse: parseDate,
  calculateAge,
  getElapsedTime,
};
