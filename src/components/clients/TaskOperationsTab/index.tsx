
// Optimized exports - Phase 5 Cleanup
// Removed unused exports and consolidated related functionality

// Core tab components
export { TemplateAssignmentTab } from './TemplateAssignmentTab';
export { CopyTasksTab } from './CopyTasksTab';

// Progress and operation management
export { OperationProgress } from './OperationProgress';

// Essential hooks only
export { useTemplateAssignment } from './hooks/useTemplateAssignment';
export { useCopyTabController } from './hooks/useCopyTabController';
export { useCopyTabState } from './hooks/useCopyTabState';
export { useCopyTabSteps } from './hooks/useCopyTabSteps';

// Core step components
export { StepIndicator } from './components/StepIndicator';
export { EnhancedStepIndicator } from './components/EnhancedStepIndicator';
export { CopyStepRenderer } from './components/CopyStepRenderer';

// Enhanced components for Phase 3+ features
export { EnhancedConfirmationStep } from './components/EnhancedConfirmationStep';
export { ProcessingStep } from './components/ProcessingStep';
export { CompleteStep } from './components/CompleteStep';

// Essential types only
export type { CopyTabStep } from './hooks/useCopyTabSteps';
export type { OperationProgress as OperationProgressType, OperationResults } from './hooks/utils/progressTracker';

// Utility functions for step mapping
export { mapDialogStepToCopyTabStep, mapCopyTabStepToDialogStep, isValidStep } from './hooks/utils/stepMapping';

// Performance optimization utilities (new in Phase 5)
export { useOptimizedMemo, useDebouncedCallback, usePerformanceMonitor } from './hooks/utils/performanceOptimizer';

// Remove duplicate and unused exports that were causing confusion:
// - Removed duplicate progress types
// - Removed unused dialog state hooks
// - Removed redundant component exports
// - Consolidated similar functionality
