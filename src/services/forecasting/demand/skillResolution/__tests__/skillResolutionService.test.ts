
/**
 * Tests for Skill Resolution Service
 * Ensures refactored code maintains exact same functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillResolutionService } from '../skillResolutionService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            { id: 'uuid-1', name: 'Tax Preparation' },
            { id: 'uuid-2', name: 'Audit' }
          ],
          error: null
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { name: 'Tax Preparation' },
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('SkillResolutionService', () => {
  beforeEach(() => {
    SkillResolutionService.clearCache();
  });

  describe('getSkillNames', () => {
    it('should handle empty array input', async () => {
      const result = await SkillResolutionService.getSkillNames([]);
      expect(result).toEqual([]);
    });

    it('should handle non-array input gracefully', async () => {
      const result = await SkillResolutionService.getSkillNames(null as any);
      expect(result).toEqual([]);
    });

    it('should filter out invalid skill IDs', async () => {
      const skillIds = ['', null, undefined, 'valid-skill'] as any[];
      const result = await SkillResolutionService.getSkillNames(skillIds);
      expect(result.length).toBe(1);
    });

    it('should return skill names for valid UUIDs', async () => {
      const skillIds = ['uuid-1', 'uuid-2'];
      const result = await SkillResolutionService.getSkillNames(skillIds);
      expect(result).toHaveLength(2);
    });
  });

  describe('validateSkillReferences', () => {
    it('should validate skill references correctly', async () => {
      const skillRefs = ['uuid-1', 'Tax Preparation'];
      const result = await SkillResolutionService.validateSkillReferences(skillRefs);
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('invalid');
      expect(result).toHaveProperty('resolved');
      expect(result).toHaveProperty('diagnostics');
    });

    it('should handle invalid input gracefully', async () => {
      const result = await SkillResolutionService.validateSkillReferences(null as any);
      expect(result.valid).toEqual([]);
      expect(result.resolved).toEqual([]);
    });
  });

  describe('getAllSkillNames', () => {
    it('should return array of skill names', async () => {
      const result = await SkillResolutionService.getAllSkillNames();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('isUUID', () => {
    it('should correctly identify valid UUIDs', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(SkillResolutionService.isUUID(validUUID)).toBe(true);
    });

    it('should correctly identify invalid UUIDs', () => {
      expect(SkillResolutionService.isUUID('not-a-uuid')).toBe(false);
      expect(SkillResolutionService.isUUID('')).toBe(false);
      expect(SkillResolutionService.isUUID(null as any)).toBe(false);
    });
  });

  describe('resolveSkillReferences', () => {
    it('should maintain backward compatibility', async () => {
      const skillRefs = ['uuid-1'];
      const result = await SkillResolutionService.resolveSkillReferences(skillRefs);
      
      expect(result).toHaveProperty('validSkills');
      expect(result).toHaveProperty('invalidSkills');
      expect(Array.isArray(result.validSkills)).toBe(true);
      expect(Array.isArray(result.invalidSkills)).toBe(true);
    });
  });
});
