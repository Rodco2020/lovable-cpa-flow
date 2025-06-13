
import { describe, it, expect } from 'vitest';
import { RecurrenceTypeCalculator } from '@/services/forecasting/demand/recurrenceCalculator/recurrenceTypes';

describe('RecurrenceTypeCalculator - Enhanced Weekly Support', () => {
  describe('calculateMonthlyOccurrences - Weekly Tasks', () => {
    it('should maintain backward compatibility when no weekdays specified', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0  // startMonth
        // no weekdays parameter
      );

      // Should use legacy formula: 4.33 / interval
      expect(result).toBeCloseTo(4.33, 2);
    });

    it('should maintain backward compatibility when empty weekdays array', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0, // startMonth
        []  // empty weekdays array
      );

      // Should use legacy formula: 4.33 / interval
      expect(result).toBeCloseTo(4.33, 2);
    });

    it('should calculate correctly for single weekday (e.g., every Monday)', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0, // startMonth
        [1] // Monday only
      );

      // 1 day per week * 4.35 weeks per month = ~4.35 occurrences
      expect(result).toBeCloseTo(4.35, 1);
    });

    it('should calculate correctly for multiple weekdays (e.g., Mon, Wed, Fri)', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0, // startMonth
        [1, 3, 5] // Monday, Wednesday, Friday
      );

      // 3 days per week * 4.35 weeks per month = ~13.05 occurrences
      expect(result).toBeCloseTo(13.05, 1);
    });

    it('should calculate correctly for all weekdays (Mon-Fri)', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0, // startMonth
        [1, 2, 3, 4, 5] // Monday through Friday
      );

      // 5 days per week * 4.35 weeks per month = ~21.75 occurrences
      expect(result).toBeCloseTo(21.75, 1);
    });

    it('should handle interval > 1 correctly', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        2, // every 2 weeks
        0, // periodMonth
        0, // startMonth
        [1, 3, 5] // Monday, Wednesday, Friday
      );

      // 3 days per week * 4.35 weeks per month / 2 interval = ~6.525 occurrences
      expect(result).toBeCloseTo(6.525, 2);
    });

    it('should handle weekend tasks correctly', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0, // startMonth
        [0, 6] // Sunday and Saturday
      );

      // 2 days per week * 4.35 weeks per month = ~8.7 occurrences
      expect(result).toBeCloseTo(8.7, 1);
    });

    it('should handle duplicate weekdays by removing them', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0, // startMonth
        [1, 1, 3, 3, 5] // Monday, Monday, Wednesday, Wednesday, Friday (duplicates)
      );

      // Should be treated as [1, 3, 5] = 3 days per week * 4.35 weeks per month = ~13.05 occurrences
      expect(result).toBeCloseTo(13.05, 1);
    });

    it('should handle invalid weekday values gracefully', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0, // startMonth
        [1, 7, 3, -1, 5] // Valid: 1, 3, 5; Invalid: 7, -1
      );

      // Should filter to [1, 3, 5] = 3 days per week * 4.35 weeks per month = ~13.05 occurrences
      expect(result).toBeCloseTo(13.05, 1);
    });

    it('should fallback to legacy when all weekdays are invalid', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1, // interval
        0, // periodMonth
        0, // startMonth
        [7, 8, -1, 'invalid' as any] // All invalid weekdays
      );

      // Should fallback to legacy formula: 4.33 / interval
      expect(result).toBeCloseTo(4.33, 2);
    });
  });

  describe('calculateMonthlyOccurrences - Other Recurrence Types', () => {
    it('should not affect daily recurrence calculations', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'daily',
        2, // every 2 days
        0, // periodMonth
        0, // startMonth
        [1, 2, 3] // weekdays should be ignored for daily
      );

      // Should use daily formula: 30 / interval = 30 / 2 = 15
      expect(result).toBe(15);
    });

    it('should not affect monthly recurrence calculations', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'monthly',
        3, // every 3 months
        0, // periodMonth
        0, // startMonth
        [1, 2, 3] // weekdays should be ignored for monthly
      );

      // Should use monthly formula: 1 / interval = 1 / 3 = 0.333...
      expect(result).toBeCloseTo(0.333, 2);
    });

    it('should not affect quarterly recurrence calculations', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'quarterly',
        1, // every quarter
        0, // periodMonth (within first 3 months of cycle)
        0, // startMonth
        [1, 2, 3] // weekdays should be ignored for quarterly
      );

      // Should use quarterly formula: 1 / interval = 1 (within active quarter)
      expect(result).toBe(1);
    });
  });

  describe('getWeeklyRecurrenceDescription', () => {
    it('should provide description for no weekdays', () => {
      const description = RecurrenceTypeCalculator.getWeeklyRecurrenceDescription(1);
      expect(description).toBe('Every week');
    });

    it('should provide description for interval > 1 with no weekdays', () => {
      const description = RecurrenceTypeCalculator.getWeeklyRecurrenceDescription(2);
      expect(description).toBe('Every 2 weeks');
    });

    it('should provide description for single weekday', () => {
      const description = RecurrenceTypeCalculator.getWeeklyRecurrenceDescription(1, [1]);
      expect(description).toBe('Monday every week');
    });

    it('should provide description for multiple weekdays', () => {
      const description = RecurrenceTypeCalculator.getWeeklyRecurrenceDescription(1, [1, 3, 5]);
      expect(description).toBe('Monday, Wednesday, Friday every week');
    });

    it('should provide description for weekdays with interval > 1', () => {
      const description = RecurrenceTypeCalculator.getWeeklyRecurrenceDescription(2, [1, 3, 5]);
      expect(description).toBe('Monday, Wednesday, Friday every 2 weeks');
    });

    it('should handle invalid weekdays gracefully', () => {
      const description = RecurrenceTypeCalculator.getWeeklyRecurrenceDescription(1, [7, 8, -1]);
      expect(description).toBe('Every week');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle non-array weekdays parameter', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1,
        0,
        0,
        'not-an-array' as any
      );

      // Should fallback to legacy formula
      expect(result).toBeCloseTo(4.33, 2);
    });

    it('should handle null weekdays parameter', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1,
        0,
        0,
        null as any
      );

      // Should fallback to legacy formula
      expect(result).toBeCloseTo(4.33, 2);
    });

    it('should handle undefined weekdays parameter', () => {
      const result = RecurrenceTypeCalculator.calculateMonthlyOccurrences(
        'weekly',
        1,
        0,
        0,
        undefined
      );

      // Should fallback to legacy formula
      expect(result).toBeCloseTo(4.33, 2);
    });
  });
});
