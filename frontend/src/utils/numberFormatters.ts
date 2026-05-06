export const formatDecimal = (
  value: number | string | null | undefined,
): string => {
  if (value == null) return 'N/A';

  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 'N/A' : num.toFixed(1);
};

export const formatInteger = (
  value: number | string | null | undefined,
): string => {
  if (value == null) return 'N/A';

  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 'N/A' : Math.round(num).toString();
};

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
