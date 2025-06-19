
/**
 * Matrix Transformer Types
 * 
 * This module provides a centralized export point for all matrix transformation types.
 * The types have been organized into focused modules for better maintainability.
 */

// Core transformation types
export * from './types/coreTypes';

// Preferred staff types
export * from './types/preferredStaffTypes';

// Options and configuration types
export * from './types/optionsTypes';

// Result and metadata types
export * from './types/resultTypes';

// Performance and monitoring types
export * from './types/performanceTypes';

// Legacy support types
export * from './types/legacyTypes';

// Enhanced types
export * from './types/enhancedTypes';

// Re-export key types for backward compatibility
export type {
  TransformationInput,
  TransformationOptions,
  TransformationResult,
  TaskPeriodData,
  SkillMonthData,
  ClientRevenueInfo,
  PreferredStaffProcessingResult,
  StaffResolutionContext,
  TransformationMetrics,
  ValidationResult
} from './types/coreTypes';
