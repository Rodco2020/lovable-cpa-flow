
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSkillFeeRatesMap,
  getSkillFeeRates,
  getSkillFeeRate,
  getMultipleSkillFeeRates,
  calculateSkillsRevenue,
  getDefaultFeeRates
} from '../feeRateService';
import * as skillsService from '../skillsService';

// Mock the skills service
vi.mock('../skillsService', () => ({
  getAllSkills: vi.fn()
}));

const mockSkills = [
  {
    id: 'cpa',
    name: 'CPA',
    description: 'Certified Public Accountant',
    category: 'Compliance',
    proficiencyLevel: 'Expert',
    hourlyRate: 150.00,
    feePerHour: 250.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'senior',
    name: 'Senior',
    description: 'Senior-level professional',
    category: 'Administrative',
    proficiencyLevel: 'Expert',
    hourlyRate: 125.00,
    feePerHour: 150.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'junior',
    name: 'Junior',
    description: 'Junior-level professional',
    category: 'Administrative',
    proficiencyLevel: 'Intermediate',
    hourlyRate: 65.00,
    feePerHour: 100.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

describe('Fee Rate Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(skillsService.getAllSkills).mockResolvedValue(mockSkills);
  });

  describe('getSkillFeeRatesMap', () => {
    it('should return a Map of skill names to fee rates', async () => {
      const result = await getSkillFeeRatesMap();
      
      expect(result).toBeInstanceOf(Map);
      expect(result.get('CPA')).toBe(250.00);
      expect(result.get('Senior')).toBe(150.00);
      expect(result.get('Junior')).toBe(100.00);
      expect(result.size).toBe(3);
    });

    it('should handle skills without fee rates', async () => {
      const skillsWithoutFees = [
        { ...mockSkills[0], feePerHour: undefined },
        { ...mockSkills[1], feePerHour: 0 },
        mockSkills[2]
      ];
      
      vi.mocked(skillsService.getAllSkills).mockResolvedValue(skillsWithoutFees);
      
      const result = await getSkillFeeRatesMap();
      
      expect(result.size).toBe(1); // Only Junior has valid fee rate
      expect(result.get('Junior')).toBe(100.00);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(skillsService.getAllSkills).mockRejectedValue(new Error('Database error'));
      
      await expect(getSkillFeeRatesMap()).rejects.toThrow('Failed to fetch skill fee rates');
    });
  });

  describe('getSkillFeeRates', () => {
    it('should return an object mapping skill names to fee rates', async () => {
      const result = await getSkillFeeRates();
      
      expect(result).toEqual({
        'CPA': 250.00,
        'Senior': 150.00,
        'Junior': 100.00
      });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(skillsService.getAllSkills).mockRejectedValue(new Error('Database error'));
      
      await expect(getSkillFeeRates()).rejects.toThrow('Failed to fetch skill fee rates');
    });
  });

  describe('getSkillFeeRate', () => {
    it('should return fee rate for existing skill', async () => {
      const result = await getSkillFeeRate('CPA');
      expect(result).toBe(250.00);
    });

    it('should return null for non-existing skill', async () => {
      const result = await getSkillFeeRate('NonExistentSkill');
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(skillsService.getAllSkills).mockRejectedValue(new Error('Database error'));
      
      const result = await getSkillFeeRate('CPA');
      expect(result).toBeNull();
    });
  });

  describe('getMultipleSkillFeeRates', () => {
    it('should return fee rates for multiple skills', async () => {
      const result = await getMultipleSkillFeeRates(['CPA', 'Senior', 'NonExistent']);
      
      expect(result).toEqual([
        { skillName: 'CPA', feePerHour: 250.00 },
        { skillName: 'Senior', feePerHour: 150.00 },
        { skillName: 'NonExistent', feePerHour: 0 }
      ]);
    });

    it('should handle empty array', async () => {
      const result = await getMultipleSkillFeeRates([]);
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(skillsService.getAllSkills).mockRejectedValue(new Error('Database error'));
      
      await expect(getMultipleSkillFeeRates(['CPA'])).rejects.toThrow('Failed to fetch multiple skill fee rates');
    });
  });

  describe('calculateSkillsRevenue', () => {
    it('should calculate total revenue correctly', async () => {
      const skillHours = {
        'CPA': 10,
        'Senior': 20,
        'Junior': 30
      };
      
      const result = await calculateSkillsRevenue(skillHours);
      
      // CPA: 10 * 250 = 2500, Senior: 20 * 150 = 3000, Junior: 30 * 100 = 3000
      // Total: 2500 + 3000 + 3000 = 8500
      expect(result).toBe(8500);
    });

    it('should handle skills without fee rates', async () => {
      const skillHours = {
        'CPA': 10,
        'NonExistent': 5
      };
      
      const result = await calculateSkillsRevenue(skillHours);
      
      // CPA: 10 * 250 = 2500, NonExistent: 5 * 0 = 0
      // Total: 2500
      expect(result).toBe(2500);
    });

    it('should handle empty skill hours', async () => {
      const result = await calculateSkillsRevenue({});
      expect(result).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(skillsService.getAllSkills).mockRejectedValue(new Error('Database error'));
      
      await expect(calculateSkillsRevenue({ 'CPA': 10 })).rejects.toThrow('Failed to calculate skills revenue');
    });
  });

  describe('getDefaultFeeRates', () => {
    it('should return default fee rates', () => {
      const result = getDefaultFeeRates();
      
      expect(result).toEqual({
        'CPA': 250.00,
        'Senior': 150.00,
        'Junior': 100.00
      });
    });
  });
});
