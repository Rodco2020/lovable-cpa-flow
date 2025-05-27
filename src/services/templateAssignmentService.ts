
/**
 * Template Assignment Service - Legacy Compatibility Layer
 * 
 * This file maintains backward compatibility for existing imports
 * while delegating to the new modular structure.
 * 
 * @deprecated Use '@/services/templateAssignment' instead for new code
 */

// Re-export everything from the new modular structure
export {
  assignTemplatesToClients,
  batchAssignTemplates,
  getAvailableTemplates
} from './templateAssignment';

// Re-export types for backward compatibility
export type { TemplateAssignment, AssignmentResult } from './templateAssignment';
