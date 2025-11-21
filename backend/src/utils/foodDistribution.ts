/**
 * Food Distribution Utilities
 * ===========================
 * Handles food analysis and calculations for survey results
 */

/**
 * Find the count of a specific food in the distribution array.
 * Handles case-insensitive matching and variations like "Pap and Wors"
 *
 * @param foodDistribution Array of food items with their counts
 * @param searchTerms Array of food names to search for
 * @returns The count of the matching food, or 0 if not found
 */
export function findFoodCount(
  foodDistribution: Array<{ food: string; count: number }>,
  searchTerms: string[],
): number {
  const found = foodDistribution.find((f) => {
    const normalized = f.food.toLowerCase().replace(/\s+/g, '');
    return searchTerms.some(
      (term) =>
        f.food.toLowerCase() === term.toLowerCase() ||
        normalized === term.toLowerCase().replace(/\s+/g, ''),
    );
  });
  return found?.count || 0;
}
