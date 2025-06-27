
import { validateMonthRange, createValidatedTimeHorizon, normalizeMonths } from '../validationUtils';

// Mock date-fns functions
jest.mock('date-fns', () => ({
  startOfMonth: jest.fn((date) => new Date(2024, 0, 1)),
  endOfMonth: jest.fn((date) => new Date(2024, 0, 31)),
  differenceInDays: jest.fn(() => 30),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  format: jest.fn(() => 'Jan 2024')
}));

describe('ValidationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console logs during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateMonthRange', () => {
    it('should return valid range when within bounds', () => {
      const result = validateMonthRange({ start: 1, end: 3 }, 5);
      expect(result).toEqual({ start: 1, end: 3 });
    });

    it('should adjust range when start is out of bounds', () => {
      const result = validateMonthRange({ start: -1, end: 3 }, 5);
      expect(result).toEqual({ start: 0, end: 3 });
    });

    it('should adjust range when end is out of bounds', () => {
      const result = validateMonthRange({ start: 1, end: 10 }, 5);
      expect(result).toEqual({ start: 1, end: 4 });
    });

    it('should ensure start is not greater than end', () => {
      const result = validateMonthRange({ start: 4, end: 2 }, 5);
      expect(result.start).toBeLessThanOrEqual(result.end);
    });
  });

  describe('createValidatedTimeHorizon', () => {
    it('should create valid time horizon from months', () => {
      const months = [
        { key: '2024-01', label: 'Jan 2024' },
        { key: '2024-02', label: 'Feb 2024' }
      ];
      
      const result = createValidatedTimeHorizon(months);
      expect(result).toHaveProperty('start');
      expect(result).toHaveProperty('end');
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
    });

    it('should handle empty months array', () => {
      const result = createValidatedTimeHorizon([]);
      expect(result).toHaveProperty('start');
      expect(result).toHaveProperty('end');
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
    });

    it('should handle invalid date strings gracefully', () => {
      const months = [{ key: 'invalid-date', label: 'Invalid' }];
      const result = createValidatedTimeHorizon(months);
      expect(result).toHaveProperty('start');
      expect(result).toHaveProperty('end');
    });
  });

  describe('normalizeMonths', () => {
    it('should normalize months with key and label', () => {
      const months = [
        { key: '2024-01', label: 'Jan 2024' },
        { key: '2024-02' } // Missing label
      ];
      
      const result = normalizeMonths(months);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ key: '2024-01', label: 'Jan 2024' });
      expect(result[1]).toHaveProperty('key', '2024-02');
      expect(result[1]).toHaveProperty('label');
    });

    it('should handle months without labels', () => {
      const months = [{ key: '2024-01' }];
      const result = normalizeMonths(months);
      expect(result[0]).toHaveProperty('label');
      expect(result[0].label).toBe('Jan 2024');
    });
  });
});
