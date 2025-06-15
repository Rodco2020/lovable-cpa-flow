
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  SuggestedRevenueCalculator, 
  SuggestedRevenueCalculatorError,
  suggestedRevenueCalculator
} from '../SuggestedRevenueCalculator';
import * as feeRateService from '@/services/skills/feeRateService';

// Mock the fee rate service
vi.mock('@/services/skills/feeRateService', () => ({
  getDefaultFeeRates: vi.fn(() => ({
    'CPA': 250.00,
    'Senior': 150.00,
    'Junior': 100.00
  }))
}));

describe('SuggestedRevenueCalculator', () => {
  let calculator: SuggestedRevenueCalculator;
  let mockSkillFeeRates: Map<string, number>;

  beforeEach(() => {
    calculator = SuggestedRevenueCalculator.getInstance();
    mockSkillFeeRates = new Map([
      ['CPA', 250.00],
      ['Senior', 150.00],  
      ['Junior', 100.00],
      ['Tax Specialist', 175.00],
      ['Bookkeeper', 75.00]
    ]);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = SuggestedRevenueCalculator.getInstance();
      const instance2 = SuggestedRevenueCalculator.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should use the exported singleton', () => {
      expect(suggestedRevenueCalculator).toBeInstanceOf(SuggestedRevenueCalculator);
    });
  });

  describe('calculateSuggestedRevenue', () => {
    it('should calculate revenue correctly for valid inputs', () => {
      const result = calculator.calculateSuggestedRevenue(10, 'CPA', mockSkillFeeRates);
      expect(result).toBe(2500.00);
    });

    it('should handle fractional hours', () => {
      const result = calculator.calculateSuggestedRevenue(2.5, 'Senior', mockSkillFeeRates);
      expect(result).toBe(375.00);
    });

    it('should handle zero hours', () => {
      const result = calculator.calculateSuggestedRevenue(0, 'Junior', mockSkillFeeRates);
      expect(result).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const result = calculator.calculateSuggestedRevenue(1.333, 'CPA', mockSkillFeeRates);
      expect(result).toBe(333.25); // 1.333 * 250 = 333.25
    });

    it('should throw error for negative hours', () => {
      expect(() => {
        calculator.calculateSuggestedRevenue(-1, 'CPA', mockSkillFeeRates);
      }).toThrow(SuggestedRevenueCalculatorError);
    });

    it('should throw error for invalid hours', () => {
      expect(() => {
        calculator.calculateSuggestedRevenue(NaN, 'CPA', mockSkillFeeRates);
      }).toThrow(SuggestedRevenueCalculatorError);
    });

    it('should throw error for empty skill name', () => {
      expect(() => {
        calculator.calculateSuggestedRevenue(10, '', mockSkillFeeRates);
      }).toThrow(SuggestedRevenueCalculatorError);
    });

    it('should throw error for whitespace-only skill name', () => {
      expect(() => {
        calculator.calculateSuggestedRevenue(10, '   ', mockSkillFeeRates);
      }).toThrow(SuggestedRevenueCalculatorError);
    });

    it('should throw error for invalid fee rates map', () => {
      expect(() => {
        calculator.calculateSuggestedRevenue(10, 'CPA', {} as any);
      }).toThrow(SuggestedRevenueCalculatorError);
    });
  });

  describe('Fallback Logic', () => {
    it('should use case-insensitive matching', () => {
      const result = calculator.calculateSuggestedRevenue(10, 'cpa', mockSkillFeeRates);
      expect(result).toBe(2500.00);
    });

    it('should use fallback rates when skill not found', () => {
      const result = calculator.calculateSuggestedRevenue(10, 'NonExistentSkill', mockSkillFeeRates);
      expect(result).toBe(750.00); // Default rate of 75.00 * 10
    });

    it('should use fallback for skills with zero rate', () => {
      const zeroRateMap = new Map([['ZeroSkill', 0]]);
      const result = calculator.calculateSuggestedRevenue(10, 'ZeroSkill', zeroRateMap);
      expect(result).toBe(750.00); // Default rate of 75.00 * 10
    });

    it('should use case-insensitive fallback matching', () => {
      const emptyMap = new Map<string, number>();
      const result = calculator.calculateSuggestedRevenue(10, 'junior', emptyMap);
      expect(result).toBe(1000.00); // Fallback Junior rate 100.00 * 10
    });
  });

  describe('calculateExpectedLessSuggested', () => {
    it('should calculate positive difference correctly', () => {
      const result = calculator.calculateExpectedLessSuggested(1000, 800);
      expect(result).toBe(200.00);
    });

    it('should calculate negative difference correctly', () => {
      const result = calculator.calculateExpectedLessSuggested(800, 1000);
      expect(result).toBe(-200.00);
    });

    it('should handle zero difference', () => {
      const result = calculator.calculateExpectedLessSuggested(1000, 1000);
      expect(result).toBe(0);
    });

    it('should handle zero values', () => {
      const result = calculator.calculateExpectedLessSuggested(0, 0);
      expect(result).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const result = calculator.calculateExpectedLessSuggested(100.333, 50.666);
      expect(result).toBe(49.67); // 100.333 - 50.666 = 49.667, rounded to 49.67
    });

    it('should throw error for invalid expected revenue', () => {
      expect(() => {
        calculator.calculateExpectedLessSuggested(NaN, 100);
      }).toThrow(SuggestedRevenueCalculatorError);
    });

    it('should throw error for invalid suggested revenue', () => {
      expect(() => {
        calculator.calculateExpectedLessSuggested(100, NaN);
      }).toThrow(SuggestedRevenueCalculatorError);
    });
  });

  describe('calculateSuggestedRevenueDetailed', () => {
    it('should return detailed calculation for existing skill', () => {
      const result = calculator.calculateSuggestedRevenueDetailed(10, 'CPA', mockSkillFeeRates);
      
      expect(result).toEqual({
        skillName: 'CPA',
        demandHours: 10,
        feeRate: 250.00,
        suggestedRevenue: 2500.00,
        isUsingFallback: false,
        calculationNotes: undefined
      });
    });

    it('should return detailed calculation with fallback', () => {
      const result = calculator.calculateSuggestedRevenueDetailed(5, 'UnknownSkill', mockSkillFeeRates);
      
      expect(result).toEqual({
        skillName: 'UnknownSkill',
        demandHours: 5,
        feeRate: 75.00, // Default fallback rate
        suggestedRevenue: 375.00,
        isUsingFallback: true,
        calculationNotes: 'Used fallback rate for skill "UnknownSkill" (original rate not found)'
      });
    });
  });

  describe('bulkCalculateSuggestedRevenue', () => {
    it('should calculate multiple skills correctly', () => {
      const demandData = [
        { skillName: 'CPA', demandHours: 10 },
        { skillName: 'Senior', demandHours: 20 },
        { skillName: 'Junior', demandHours: 30 }
      ];

      const results = calculator.bulkCalculateSuggestedRevenue(demandData, mockSkillFeeRates);

      expect(results).toHaveLength(3);
      expect(results[0].suggestedRevenue).toBe(2500.00); // 10 * 250
      expect(results[1].suggestedRevenue).toBe(3000.00); // 20 * 150  
      expect(results[2].suggestedRevenue).toBe(3000.00); // 30 * 100
    });

    it('should handle empty array', () => {
      const results = calculator.bulkCalculateSuggestedRevenue([], mockSkillFeeRates);
      expect(results).toEqual([]);
    });

    it('should handle errors gracefully in bulk calculation', () => {
      const demandData = [
        { skillName: 'CPA', demandHours: 10 },
        { skillName: '', demandHours: 20 }, // Invalid skill name
        { skillName: 'Junior', demandHours: 30 }
      ];

      const results = calculator.bulkCalculateSuggestedRevenue(demandData, mockSkillFeeRates);

      expect(results).toHaveLength(3);
      expect(results[0].suggestedRevenue).toBe(2500.00);
      expect(results[1].suggestedRevenue).toBe(0); // Error case with zero revenue
      expect(results[1].isUsingFallback).toBe(true);
      expect(results[1].calculationNotes).toContain('Error in calculation');
      expect(results[2].suggestedRevenue).toBe(3000.00);
    });
  });

  describe('getTotalSuggestedRevenue', () => {
    it('should sum multiple calculations correctly', () => {
      const calculations = [
        { skillName: 'CPA', demandHours: 10, feeRate: 250, suggestedRevenue: 2500, isUsingFallback: false },
        { skillName: 'Senior', demandHours: 20, feeRate: 150, suggestedRevenue: 3000, isUsingFallback: false },
        { skillName: 'Junior', demandHours: 30, feeRate: 100, suggestedRevenue: 3000, isUsingFallback: false }
      ];

      const total = calculator.getTotalSuggestedRevenue(calculations);
      expect(total).toBe(8500.00);
    });

    it('should handle empty calculations array', () => {
      const total = calculator.getTotalSuggestedRevenue([]);
      expect(total).toBe(0);
    });

    it('should round total to 2 decimal places', () => {
      const calculations = [
        { skillName: 'Test', demandHours: 1.333, feeRate: 100, suggestedRevenue: 133.33, isUsingFallback: false },
        { skillName: 'Test2', demandHours: 2.666, feeRate: 100, suggestedRevenue: 266.67, isUsingFallback: false }
      ];

      const total = calculator.getTotalSuggestedRevenue(calculations);
      expect(total).toBe(400.00);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large bulk calculations efficiently', () => {
      const startTime = performance.now();
      
      // Generate 1000 calculation requests
      const demandData = Array.from({ length: 1000 }, (_, i) => ({
        skillName: `Skill${i % 5}`, // Cycle through 5 different skills
        demandHours: Math.random() * 100
      }));

      const results = calculator.bulkCalculateSuggestedRevenue(demandData, mockSkillFeeRates);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const result = calculator.calculateSuggestedRevenue(999999, 'CPA', mockSkillFeeRates);
      expect(result).toBe(249999750.00);
    });

    it('should handle very small decimal hours', () => {
      const result = calculator.calculateSuggestedRevenue(0.01, 'CPA', mockSkillFeeRates);
      expect(result).toBe(2.50);
    });

    it('should handle skills with special characters', () => {
      const specialMap = new Map([['C++ Developer', 200.00]]);
      const result = calculator.calculateSuggestedRevenue(10, 'C++ Developer', specialMap);
      expect(result).toBe(2000.00);
    });

    it('should handle Unicode skill names', () => {
      const unicodeMap = new Map([['Développeur', 180.00]]);
      const result = calculator.calculateSuggestedRevenue(5, 'Développeur', unicodeMap);
      expect(result).toBe(900.00);
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error messages', () => {
      try {
        calculator.calculateSuggestedRevenue(-5, 'CPA', mockSkillFeeRates);
      } catch (error) {
        expect(error).toBeInstanceOf(SuggestedRevenueCalculatorError);
        expect(error.message).toContain('Failed to calculate suggested revenue for skill "CPA"');
        expect(error.code).toBe('CALCULATION_ERROR');
      }
    });

    it('should handle null/undefined inputs gracefully', () => {
      expect(() => {
        calculator.calculateSuggestedRevenue(null as any, 'CPA', mockSkillFeeRates);
      }).toThrow(SuggestedRevenueCalculatorError);

      expect(() => {
        calculator.calculateSuggestedRevenue(10, null as any, mockSkillFeeRates);
      }).toThrow(SuggestedRevenueCalculatorError);

      expect(() => {
        calculator.calculateSuggestedRevenue(10, 'CPA', null as any);
      }).toThrow(SuggestedRevenueCalculatorError);
    });
  });
});
