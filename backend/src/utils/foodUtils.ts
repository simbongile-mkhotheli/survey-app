/**
 * Food Utilities
 * ==============
 * Centralizes food data parsing and formatting
 * Handles conversion between CSV storage format and array format
 */

/**
 * Convert array of food strings to CSV format (storage format)
 * Used when storing food selections in database
 *
 * @param foods Array of food names
 * @returns Comma-separated string of foods
 *
 * @example
 * toCSV(['pizza', 'pasta']) // 'pizza,pasta'
 */
export function toCSV(foods: string[]): string {
  return foods.join(',');
}

/**
 * Parse CSV string to array of food strings (domain format)
 * Used when retrieving food selections from database
 * Handles whitespace trimming and empty values
 *
 * @param csv Comma-separated string of foods
 * @returns Array of food names
 *
 * @example
 * fromCSV('pizza, pasta') // ['pizza', 'pasta']
 * fromCSV('pizza,pasta') // ['pizza', 'pasta']
 */
export function fromCSV(csv: string): string[] {
  if (!csv || csv.trim() === '') {
    return [];
  }
  return csv
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
}

/**
 * Validate food array
 * Checks constraints: minimum 1 item, maximum 10 items
 *
 * @param foods Array of food names to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * isValidFoodArray(['pizza', 'pasta']) // true
 * isValidFoodArray([]) // false (empty)
 * isValidFoodArray(new Array(11).fill('pizza')) // false (too many)
 */
export function isValidFoodArray(foods: unknown[]): boolean {
  if (!Array.isArray(foods)) return false;
  return foods.length >= 1 && foods.length <= 10;
}

/**
 * Normalize food name for consistent matching
 * Used for comparing food values across sources
 *
 * @param food Food name to normalize
 * @returns Lowercased, trimmed food name
 *
 * @example
 * normalizeFoodName('Pizza') // 'pizza'
 * normalizeFoodName('  Pap and Wors  ') // 'pap and wors'
 */
export function normalizeFoodName(food: string): string {
  return food.toLowerCase().trim();
}

/**
 * Deduplicates food array (case-insensitive)
 * Preserves first occurrence
 *
 * @param foods Array of food names (may contain duplicates)
 * @returns Array with duplicates removed
 *
 * @example
 * deduplicateFoods(['pizza', 'Pizza', 'pasta']) // ['pizza', 'pasta']
 */
export function deduplicateFoods(foods: string[]): string[] {
  const seen = new Set<string>();
  return foods.filter((food) => {
    const normalized = normalizeFoodName(food);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

/**
 * Food utilities object for convenient access
 * @example
 * foodUtils.toCSV(foods)
 * foodUtils.fromCSV(csvString)
 */
export const foodUtils = {
  toCSV,
  fromCSV,
  isValidFoodArray,
  normalize: normalizeFoodName,
  deduplicate: deduplicateFoods,
};
