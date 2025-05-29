
export { TemplateAssignmentTab } from './TemplateAssignmentTab';
export { CopyTasksTab } from './CopyTasksTab';
export { OperationProgress } from './OperationProgress';
export { useTemplateAssignment } from './hooks/useTemplateAssignment';

// Export unified state management hooks
export { useDialogState } from './hooks/useDialogState';
export { useOperationProgress } from './hooks/useOperationProgress';

// Export new copy tab hooks
export { useCopyTabController } from './hooks/useCopyTabController';
export { useCopyTabState } from './hooks/useCopyTabState';
export { useCopyTabProgress } from './hooks/useCopyTabProgress';
export { useCopyTabSteps } from './hooks/useCopyTabSteps';

// Export step components for potential reuse
export { StepIndicator } from './components/StepIndicator';
export { SelectionStep } from './components/SelectionStep';
export { ConfigurationStep } from './components/ConfigurationStep';
export { ConfirmationStep } from './components/ConfirmationStep';
export { ProcessingStep } from './components/ProcessingStep';
export { CompleteStep } from './components/CompleteStep';
export { ProgressHeader } from './components/ProgressHeader';
export { CopyStepRenderer } from './components/CopyStepRenderer';

// Export utility types for external use
export type { OperationProgress as OperationProgressType, OperationResults } from './hooks/utils/progressTracker';
export type { DialogTab } from './hooks/useDialogState';

// Export enhanced copy components for Phase 3
export { EnhancedConfirmationStep } from './components/EnhancedConfirmationStep';
export { EnhancedTaskFilterPanel } from '../CopyTasks/components/EnhancedTaskFilterPanel';
export { EnhancedTaskSelectionList } from '../CopyTasks/components/EnhancedTaskSelectionList';
export { SelectTasksStepEnhanced } from '../CopyTasks/SelectTasksStepEnhanced';

// Export enhanced hooks
export { useEnhancedTaskSelection } from '../CopyTasks/hooks/useEnhancedTaskSelection';
export type { UnifiedTask, TaskWithType, AdHocTaskWithType } from '../CopyTasks/hooks/useEnhancedTaskSelection';

// Export new copy tab types
export type { CopyTabStep } from './hooks/useCopyTabSteps';
