
/**
 * Legacy Skills Service - Compatibility Layer
 * 
 * This file maintains backwards compatibility while redirecting to the new modular
 * skills service. It ensures existing imports continue to work without modification.
 * 
 * @deprecated Use imports from '@/services/skills' instead
 */

// Re-export everything from the new modular service
export {
  getAllSkills,
  getSkillById,
  resolveSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  SkillsServiceError,
  createFallbackSkill,
  getDefaultSkills
} from './skills/skillsService';

export type {
  SkillCreateData,
  SkillUpdateData,
  SkillRow
} from './skills/types';

export { mapSkillFromDB } from './skills/mappers';

// Legacy warning for developers
console.warn(
  'skillsService.ts is deprecated. Please import from "@/services/skills" instead for better tree-shaking and modularity.'
);
