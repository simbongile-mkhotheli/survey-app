// backend/src/test/unit/utils/foodDistribution.test.ts
import { describe, it, expect } from 'vitest';
import { findFoodCount } from '@/utils/foodDistribution';

describe('Food Distribution Utilities', () => {
  describe('findFoodCount', () => {
    const foodDistribution = [
      { food: 'Pizza', count: 45 },
      { food: 'Pasta', count: 32 },
      { food: 'Pap and Wors', count: 28 },
      { food: 'Burger', count: 15 },
      { food: 'Sushi', count: 8 },
    ];

    describe('Exact Match - Case Insensitive', () => {
      it('should find food by exact lowercase match', () => {
        const result = findFoodCount(foodDistribution, ['pizza']);
        expect(result).toBe(45);
      });

      it('should find food by exact uppercase match', () => {
        const result = findFoodCount(foodDistribution, ['PIZZA']);
        expect(result).toBe(45);
      });

      it('should find food by mixed case match', () => {
        const result = findFoodCount(foodDistribution, ['PiZZa']);
        expect(result).toBe(45);
      });
    });

    describe('Whitespace Normalization', () => {
      it('should match foods with whitespace variations', () => {
        const result = findFoodCount(foodDistribution, ['pap and wors']);
        expect(result).toBe(28);
      });

      it('should match foods ignoring extra whitespace', () => {
        const result = findFoodCount(foodDistribution, ['papandwors']);
        expect(result).toBe(28);
      });

      it('should match foods with multiple spaces', () => {
        const result = findFoodCount(foodDistribution, ['pap  and   wors']);
        expect(result).toBe(28);
      });
    });

    describe('Multiple Search Terms', () => {
      it('should find food matching first search term', () => {
        const result = findFoodCount(foodDistribution, ['burger', 'hotdog']);
        expect(result).toBe(15);
      });

      it('should find food matching any search term', () => {
        const result = findFoodCount(foodDistribution, ['sushi', 'pizza']);
        // Returns first match found in array
        expect(result).toBe(45); // Pizza is found first in distribution array
      });

      it('should check all search terms before returning zero', () => {
        const result = findFoodCount(foodDistribution, [
          'tacos',
          'burrito',
          'pasta',
        ]);
        expect(result).toBe(32);
      });
    });

    describe('Non-Existent Foods', () => {
      it('should return 0 for non-existent food', () => {
        const result = findFoodCount(foodDistribution, ['tacos']);
        expect(result).toBe(0);
      });

      it('should return 0 for empty search terms array', () => {
        const result = findFoodCount(foodDistribution, []);
        expect(result).toBe(0);
      });

      it('should return 0 for similar but non-matching food name', () => {
        const result = findFoodCount(foodDistribution, ['pizzas']);
        expect(result).toBe(0);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty food distribution array', () => {
        const result = findFoodCount([], ['pizza']);
        expect(result).toBe(0);
      });

      it('should handle food names with special characters', () => {
        const specialFoods = [
          { food: 'Fish & Chips', count: 20 },
          { food: "McDonald's", count: 35 },
        ];
        const result = findFoodCount(specialFoods, ['fish & chips']);
        expect(result).toBe(20);
      });

      it('should handle foods with numbers', () => {
        const numberedFoods = [
          { food: 'Meal 2000', count: 12 },
          { food: 'Regular Meal', count: 25 },
        ];
        const result = findFoodCount(numberedFoods, ['meal 2000']);
        expect(result).toBe(12);
      });

      it('should return count from first matching food', () => {
        const duplicateFoods = [
          { food: 'Pizza', count: 45 },
          { food: 'PIZZA', count: 10 }, // Different case, would normalize to same
        ];
        const result = findFoodCount(duplicateFoods, ['pizza']);
        expect(result).toBe(45); // Returns first match
      });
    });

    describe('Real-World Scenarios', () => {
      it('should handle survey food preferences lookup', () => {
        const surveyFoods = [
          { food: 'Jollof Rice', count: 156 },
          { food: 'Pap and Wors', count: 89 },
          { food: 'Pizza', count: 234 },
          { food: 'Sushi', count: 45 },
        ];

        // Most popular food
        expect(findFoodCount(surveyFoods, ['pizza'])).toBe(234);

        // Traditional food
        expect(findFoodCount(surveyFoods, ['pap and wors'])).toBe(89);

        // Non-existent in survey
        expect(findFoodCount(surveyFoods, ['burger'])).toBe(0);
      });

      it('should handle case variations from user input', () => {
        const foods = [
          { food: 'Chicken Rice', count: 78 },
          { food: 'Beef Stew', count: 62 },
        ];

        // User might type in different cases
        expect(findFoodCount(foods, ['CHICKEN RICE'])).toBe(78);
        expect(findFoodCount(foods, ['BeEf StEw'])).toBe(62);
      });
    });

    describe('Performance & Type Safety', () => {
      it('should return number type', () => {
        const result = findFoodCount(foodDistribution, ['pizza']);
        expect(typeof result).toBe('number');
      });

      it('should handle large food distribution arrays', () => {
        const largeFoodList = Array.from({ length: 1000 }, (_, i) => ({
          food: `Food${i}`,
          count: i,
        }));
        largeFoodList[500] = { food: 'Target Food', count: 999 };

        const result = findFoodCount(largeFoodList, ['target food']);
        expect(result).toBe(999);
      });

      it('should return exact count value', () => {
        const foods = [{ food: 'Test Food', count: 42 }];
        const result = findFoodCount(foods, ['test food']);
        expect(result).toBe(42);
        expect(result).not.toBe(41);
        expect(result).not.toBe(43);
      });
    });
  });
});
