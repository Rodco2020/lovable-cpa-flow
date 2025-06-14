
/**
 * Skills Service Module
 * 
 * This module provides a comprehensive interface for managing skills within the CPA Practice
 * Management Software. It includes robust error handling, fallback mechanisms, and utilities
 * for skill resolution and management.
 * 
 * The service is designed with modularity and maintainability in mind, separating concerns
 * into focused modules while maintaining backwards compatibility.
 */

// Main service exports
export {
  getAllSkills,
  getSkillById,
  getSkillsByIds,
  resolveSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillsByCategory,
  getSkillsByProficiencyLevel,
  searchSkills,
  SkillsServiceError,
  createFallbackSkill
} from './skillsService';

export { getDefaultSkills } from './defaults';

// Type exports
export type {
  SkillsServiceError as SkillsError,
  SkillCreateData,
  SkillUpdateData,
  SkillRow
} from './types';

// Utility exports
export { mapSkillFromDB } from './mappers';
