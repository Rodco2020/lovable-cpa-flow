
export { TemplateAssignmentTab } from './TemplateAssignmentTab';
export { OperationProgress } from './OperationProgress';
export { useTemplateAssignment } from './hooks/useTemplateAssignment';

// Export step components for potential reuse
export { StepIndicator } from './components/StepIndicator';
export { SelectionStep } from './components/SelectionStep';
export { ConfigurationStep } from './components/ConfigurationStep';
export { ConfirmationStep } from './components/ConfirmationStep';
export { ProcessingStep } from './components/ProcessingStep';
export { CompleteStep } from './components/CompleteStep';
export { ProgressHeader } from './components/ProgressHeader';

// Export utility types for external use
export type { OperationProgress as OperationProgressType, OperationResults } from './hooks/utils/progressTracker';
