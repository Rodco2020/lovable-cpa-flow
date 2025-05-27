
/**
 * Template Assignment Service - Main Module
 * 
 * Central export point for all template assignment operations.
 * This module provides backward compatibility while organizing
 * functionality into focused, maintainable modules.
 */

// Export main functions
export { assignTemplatesToClients, batchAssignTemplates } from './assignmentProcessor';
export { getAvailableTemplates } from './templateDataService';

// Export types for consumers
export type { TemplateAssignment, AssignmentResult } from './types';
