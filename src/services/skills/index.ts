
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
  resolveSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  SkillsServiceError,
  createFallbackSkill,
  getDefaultSkills
} from './skillsService';

// Type exports
export type {
  SkillsServiceError as SkillsError,
  SkillCreateData,
  SkillUpdateData,
  SkillRow
} from './types';

// Utility exports
export { mapSkillFromDB } from './mappers';
