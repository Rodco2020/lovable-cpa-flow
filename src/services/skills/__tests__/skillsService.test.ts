
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllSkills, resolveSkills, createSkill } from '../skillsService';
import { getDefaultSkills } from '../defaults';
import { createFallbackSkill } from '../mappers';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('Skills Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllSkills', () => {
    it('should return default skills when database is empty', async () => {
      const skills = await getAllSkills();
      const defaultSkills = getDefaultSkills();
      
      expect(skills).toHaveLength(defaultSkills.length);
      expect(skills[0]).toHaveProperty('id');
      expect(skills[0]).toHaveProperty('name');
      expect(skills[0]).toHaveProperty('category');
    });
  });

  describe('resolveSkills', () => {
    it('should return empty array for empty input', async () => {
      const result = await resolveSkills([]);
      expect(result).toEqual([]);
    });

    it('should create fallback skills for unknown skill names', async () => {
      const skillNames = ['Unknown Skill'];
      const result = await resolveSkills(skillNames);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Unknown Skill');
      expect(result[0].id).toBe('fallback-unknown-skill');
    });

    it('should resolve known skills from defaults', async () => {
      const skillNames = ['CPA'];
      const result = await resolveSkills(skillNames);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('CPA');
      expect(result[0].id).toBe('cpa');
    });
  });

  describe('createFallbackSkill', () => {
    it('should create a valid fallback skill', () => {
      const skillName = 'Test Skill';
      const fallback = createFallbackSkill(skillName);
      
      expect(fallback.name).toBe(skillName);
      expect(fallback.id).toBe('fallback-test-skill');
      expect(fallback.category).toBe('Other');
      expect(fallback.proficiencyLevel).toBe('Intermediate');
      expect(fallback.description).toContain(skillName);
    });
  });
});
