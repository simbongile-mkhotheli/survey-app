/**
 * Number Formatting Utilities
 * ============================
 * Centralized number formatting functions for consistent display across application
 * Follows DRY principle - used in Results, Analytics, Reports
 */

/**
 * Format number to 1 decimal place or return 'N/A'
 *
 * Safely converts any numeric input to a string with exactly 1 decimal place.
 * Returns 'N/A' for null, undefined, or NaN values.
 *
 * @param value Number, string representation of number, or null/undefined
 * @returns Formatted string with 1 decimal place (e.g., "28.5") or 'N/A'
 *
 * @example
 * formatDecimal(28.567) // '28.6'
 * formatDecimal('45.123') // '45.1'
 * formatDecimal(null) // 'N/A'
 * formatDecimal(NaN) // 'N/A'
 *
 * @throws Never throws - always returns valid string
 */
export const formatDecimal = (
  value: number | string | null | undefined,
): string => {
  if (value == null) return 'N/A';

  const num = Number(value);
  return isNaN(num) ? 'N/A' : num.toFixed(1);
};

/**
 * Format number to integer or return 'N/A'
 *
 * Safely converts any numeric input to a rounded integer string.
 * Returns 'N/A' for null, undefined, or NaN values.
 *
 * @param value Number, string representation of number, or null/undefined
 * @returns Formatted integer string (e.g., "28") or 'N/A'
 *
 * @example
 * formatInteger(28.7) // '29'
 * formatInteger('45.123') // '45'
 * formatInteger(null) // 'N/A'
 * formatInteger(NaN) // 'N/A'
 *
 * @throws Never throws - always returns valid string
 */
export const formatInteger = (
  value: number | string | null | undefined,
): string => {
  if (value == null) return 'N/A';

  const num = Number(value);
  return isNaN(num) ? 'N/A' : Math.round(num).toString();
};

/**
 * Format number as percentage to 1 decimal place
 *
 * Converts number to percentage string with 1 decimal place and % suffix.
 * Useful for displaying percentages (0-100 range).
 *
 * @param value Number 0-100 representing percentage, or null/undefined
 * @returns Formatted percentage string (e.g., "45.5%") or 'N/A'
 *
 * @example
 * formatPercentage(45.567) // '45.6%'
 * formatPercentage('30.2') // '30.2%'
 * formatPercentage(null) // 'N/A'
 *
 * @throws Never throws - always returns valid string
 */
export const formatPercentage = (
  value: number | string | null | undefined,
): string => {
  const decimal = formatDecimal(value);
  return decimal === 'N/A' ? 'N/A' : `${decimal}%`;
};

/**
 * Format age value to integer with 'years' suffix
 *
 * Converts number to age string with proper formatting and unit suffix.
 * Used consistently in age-related displays.
 *
 * @param value Age in years as number, string, or null/undefined
 * @returns Formatted age string (e.g., "28 years") or 'N/A'
 *
 * @example
 * formatAge(28) // '28 years'
 * formatAge('65') // '65 years'
 * formatAge(null) // 'N/A'
 *
 * @throws Never throws - always returns valid string
 */
export const formatAge = (
  value: number | string | null | undefined,
): string => {
  const integer = formatInteger(value);
  return integer === 'N/A' ? 'N/A' : `${integer} years`;
};

/**
 * Format rating value (1-5) to string with proper display
 *
 * Validates and formats rating numbers to ensure they're within valid range.
 * Returns 'N/A' for out-of-range or invalid values.
 *
 * @param value Rating as number 1-5, string, or null/undefined
 * @returns Formatted rating string or 'N/A'
 *
 * @example
 * formatRating(4.2) // '4.2'
 * formatRating('3') // '3.0'
 * formatRating(0) // 'N/A' (out of range)
 * formatRating(null) // 'N/A'
 *
 * @throws Never throws - always returns valid string
 */
export const formatRating = (
  value: number | string | null | undefined,
): string => {
  if (value == null) return 'N/A';

  const num = Number(value);

  // Validate rating is in valid range (1-5)
  if (isNaN(num) || num < 1 || num > 5) {
    return 'N/A';
  }

  return num.toFixed(1);
};
