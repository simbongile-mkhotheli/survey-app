/**
 * Date Utilities (Frontend)
 * =========================
 * Frontend date formatting helpers matching backend implementation
 */

/**
 * Format a date to ISO 8601 date string (YYYY-MM-DD)
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
 * Parse date string to Date object
 *
 * @param dateString Date string to parse
 * @returns Date object in UTC
 *
 * @example
 * parseDate('2025-11-22') // Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Format date to ISO 8601 datetime string
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
 * Format date to readable locale string
 *
 * @param date Date to format
 * @param locale Locale code (default: 'en-US')
 * @returns Formatted date string
 *
 * @example
 * formatDateLocale(new Date()) // 'November 22, 2025'
 */
export function formatDateLocale(
  date: Date | string,
  locale: string = 'en-US',
): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time to readable locale string
 *
 * @param date Date to format
 * @param locale Locale code (default: 'en-US')
 * @returns Formatted datetime string
 *
 * @example
 * formatDatetimeLocale(new Date()) // 'November 22, 2025, 10:30:00 AM'
 */
export function formatDatetimeLocale(
  date: Date | string,
  locale: string = 'en-US',
): string {
  return new Date(date).toLocaleString(locale);
}

/**
 * Calculate age from date of birth
 *
 * @param dateOfBirth Date of birth string or Date object
 * @returns Age in years
 *
 * @example
 * calculateAge('2000-01-15') // 25
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
 * Format relative time (e.g., "2 hours ago")
 *
 * @param date Date to format
 * @returns Human-readable relative time
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // '1 hour ago'
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 60) return 'just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  return formatDateLocale(date);
}

/**
 * Date utilities object for convenient access
 * @example
 * dateUtils.format(date)
 * dateUtils.calculateAge(birthDate)
 */
export const dateUtils = {
  format: formatDate,
  formatDatetime,
  parse: parseDate,
  formatLocale: formatDateLocale,
  formatDatetimeLocale,
  calculateAge,
  formatRelativeTime,
};
