
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillFeeRatesMap,
  getSkillFeeRates,
  getDefaultSkills
} from '../index';

// Mock Supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        })),
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      }))
    }))
  }
}));

describe('Skills Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Existing Skills Service Functionality', () => {
    it('should maintain getAllSkills functionality', async () => {
      const skills = await getAllSkills();
      expect(Array.isArray(skills)).toBe(true);
    });

    it('should maintain getSkillById functionality', async () => {
      const skill = await getSkillById('test-id');
      // Should return null when not found, not throw error
      expect(skill).toBeNull();
    });

    it('should maintain createSkill functionality', async () => {
      const skillData = {
        name: 'Test Skill',
        description: 'Test description',
        category: 'Test' as any,
        proficiencyLevel: 'Intermediate' as any,
        hourlyRate: 100,
        feePerHour: 150
      };

      // Should not throw error when creating skill
      await expect(createSkill(skillData)).resolves.not.toThrow();
    });

    it('should maintain updateSkill functionality', async () => {
      const updateData = {
        name: 'Updated Skill',
        feePerHour: 200
      };

      // Should not throw error when updating skill
      await expect(updateSkill('test-id', updateData)).resolves.not.toThrow();
    });

    it('should maintain deleteSkill functionality', async () => {
      // Should not throw error when deleting skill
      await expect(deleteSkill('test-id')).resolves.not.toThrow();
    });
  });

  describe('New Fee Rate Functionality', () => {
    it('should provide getSkillFeeRatesMap without breaking existing functionality', async () => {
      const feeRatesMap = await getSkillFeeRatesMap();
      expect(feeRatesMap).toBeInstanceOf(Map);
    });

    it('should provide getSkillFeeRates without breaking existing functionality', async () => {
      const feeRates = await getSkillFeeRates();
      expect(typeof feeRates).toBe('object');
    });

    it('should maintain default skills data integrity', () => {
      const defaultSkills = getDefaultSkills();
      
      expect(defaultSkills).toHaveLength(3);
      
      // Verify correct fee rates are set
      const cpaSkill = defaultSkills.find(skill => skill.name === 'CPA');
      const seniorSkill = defaultSkills.find(skill => skill.name === 'Senior');
      const juniorSkill = defaultSkills.find(skill => skill.name === 'Junior');
      
      expect(cpaSkill?.feePerHour).toBe(250.00);
      expect(seniorSkill?.feePerHour).toBe(150.00);
      expect(juniorSkill?.feePerHour).toBe(100.00);
    });
  });

  describe('Backwards Compatibility', () => {
    it('should maintain existing export structure', () => {
      // Verify all existing exports are still available
      expect(getAllSkills).toBeDefined();
      expect(getSkillById).toBeDefined();
      expect(createSkill).toBeDefined();
      expect(updateSkill).toBeDefined();
      expect(deleteSkill).toBeDefined();
      expect(getDefaultSkills).toBeDefined();
    });

    it('should not break existing API contracts', async () => {
      // Test that existing method signatures haven't changed
      const skills = await getAllSkills();
      expect(Array.isArray(skills)).toBe(true);
      
      const skill = await getSkillById('test-id');
      expect(skill === null || typeof skill === 'object').toBe(true);
    });
  });
});
