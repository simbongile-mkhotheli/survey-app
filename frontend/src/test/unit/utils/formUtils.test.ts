import { describe, it, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import {
  formDateToISO,
  isoToFormDate,
  trimObjectValues,
  toLowercase,
  sanitizeString,
  sanitizeObject,
  getChangedFields,
  hasValues,
} from '../../../utils/formUtils';
import {
  createRandomDateString,
  createRandomObjectWithWhitespace,
  createRandomFieldChanges,
} from '../../../test/utils/test-helpers';

describe('formUtils', () => {
  describe('formDateToISO', () => {
    it('converts form dates to ISO', () => {
      const dateStr = createRandomDateString();
      const result = formDateToISO(dateStr);
      expect(result).toContain(dateStr);
      expect(result).toContain('T');
    });
  });

  describe('isoToFormDate', () => {
    it('converts ISO to form date', () => {
      const isoDate = faker.date.past().toISOString();
      const result = isoToFormDate(isoDate);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('trimObjectValues', () => {
    it('trims string values', () => {
      const obj = createRandomObjectWithWhitespace();
      const result = trimObjectValues(obj);
      // Check that all string values have been trimmed
      Object.values(result).forEach((value) => {
        if (typeof value === 'string') {
          expect(value).not.toMatch(/^\s/);
          expect(value).not.toMatch(/\s$/);
        }
      });
    });

    it('preserves non-strings', () => {
      const age = faker.number.int({ min: 18, max: 70 });
      const obj = {
        name: `  ${faker.person.firstName()}  `,
        age,
        active: true,
      };
      const result = trimObjectValues(obj);
      expect(result.age).toBe(age);
      expect(result.active).toBe(true);
    });
  });

  describe('toLowercase', () => {
    it('lowercases specified fields', () => {
      const email = faker.internet.email().toUpperCase();
      const name = faker.person.firstName();
      const obj = { email, name };
      const result = toLowercase(obj, ['email']);
      expect(result.email).toBe(email.toLowerCase());
      expect(result.name).toBe(name);
    });
  });

  describe('sanitizeString', () => {
    it('removes script tags', () => {
      const result = sanitizeString(`<script>${faker.lorem.word()}</script>`);
      expect(result).not.toContain('<script>');
    });

    it('removes javascript protocol', () => {
      const result = sanitizeString(`javascript:${faker.lorem.word()}()`);
      expect(result).not.toContain('javascript:');
    });

    it('removes event handlers', () => {
      const result = sanitizeString(
        `on${faker.lorem.word()}="${faker.lorem.word()}"`,
      );
      expect(result).not.toContain('on');
    });

    it('preserves normal text', () => {
      const text = faker.lorem.sentence();
      expect(sanitizeString(text)).toBe(text);
    });
  });

  describe('sanitizeObject', () => {
    it('sanitizes object values', () => {
      const obj = {
        name: `<script>${faker.lorem.word()}</script>test`,
        email: faker.internet.email(),
      };
      const result = sanitizeObject(obj);
      expect(result.name).not.toContain('<script>');
      expect(result.email).toBe(obj.email);
    });

    it('preserves non-string values', () => {
      const age = faker.number.int({ min: 18, max: 70 });
      const obj = { name: '<script>test</script>', age };
      const result = sanitizeObject(obj);
      expect(result.age).toBe(age);
    });
  });

  describe('getChangedFields', () => {
    it('detects changed fields', () => {
      const { original, updated } = createRandomFieldChanges();
      const changed = getChangedFields(original, updated);
      expect(changed).toHaveProperty('email');
      expect((changed as Record<string, unknown>).email).not.toBe(
        original.email,
      );
    });

    it('returns empty for no changes', () => {
      const orig = {
        name: faker.person.firstName(),
        email: faker.internet.email(),
      };
      const changed = getChangedFields(orig, orig);
      expect(changed).toEqual({});
    });
  });

  describe('hasValues', () => {
    it('returns true for non-empty objects', () => {
      expect(hasValues({ name: faker.person.firstName() })).toBe(true);
      expect(hasValues({ age: faker.number.int() })).toBe(true);
    });

    it('returns false for empty objects', () => {
      expect(hasValues({})).toBe(false);
      expect(hasValues({ name: '' })).toBe(false);
    });

    it('treats 0 and false as valid values', () => {
      expect(hasValues({ age: 0 })).toBe(true);
      expect(hasValues({ active: false })).toBe(true);
    });
  });
});
