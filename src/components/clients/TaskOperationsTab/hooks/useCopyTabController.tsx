
import { useCopyTabState } from './useCopyTabState';
import { useCopyTabSteps } from './useCopyTabSteps';

/**
 * Enhanced Copy Tab Controller - 6-Step Workflow with Feature Flags
 * 
 * This controller manages the complete 6-step workflow with enhanced validation,
 * error handling, and feature flag support for safe rollout.
 * 
 * Features:
 * - Complete 6-step workflow management
 * - Enhanced validation at each step
 * - Feature flag support for safe testing
 * - Performance monitoring integration
 * - Error recovery and user guidance
 */

// Feature flag for 6-step workflow (can be controlled via environment or configuration)
const ENABLE_SIX_STEP_WORKFLOW = true; // TODO: Make this configurable

export const useCopyTabController = (
  initialClientId: string,
  onClose?: () => void,
  onTasksRefresh?: () => void
) => {
  const { copySteps, requiresValidation, getStepDescription } = useCopyTabSteps();
  
  const {
    currentStep,
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    availableClients,
    isClientsLoading,
    isProcessing,
    isSuccess,
    getSourceClientName,
    getTargetClientName,
    canGoNext,
    handleSelectSourceClient,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    resetDialog
  } = useCopyTabState(initialClientId, onClose);

  // Enhanced validation for step progression
  const validateStepProgression = (step: typeof currentStep): boolean => {
    if (!ENABLE_SIX_STEP_WORKFLOW) {
      // Fallback to legacy validation if feature flag is disabled
      return canGoNext;
    }

    switch (step) {
      case 'select-source-client':
        return !!sourceClientId && sourceClientId.trim() !== '';
      case 'selection':
        return !!sourceClientId && !!targetClientId && 
               sourceClientId !== targetClientId &&
               targetClientId.trim() !== '';
      case 'task-selection':
        return selectedTaskIds.length > 0;
      case 'confirmation':
        return !!sourceClientId && !!targetClientId && selectedTaskIds.length > 0;
      case 'processing':
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  // Enhanced copy execution with validation and error handling
  const onExecuteCopy = async () => {
    if (!ENABLE_SIX_STEP_WORKFLOW) {
      console.log('Controller: Using legacy copy execution');
      try {
        await handleCopy();
        if (onTasksRefresh) {
          onTasksRefresh();
        }
      } catch (error) {
        console.error('Controller: Legacy copy operation failed:', error);
      }
      return;
    }

    console.log('Controller: Executing enhanced copy operation with validation');
    
    // Pre-execution validation
    if (!validateStepProgression('confirmation')) {
      console.error('Controller: Copy validation failed');
      return;
    }

    try {
      await handleCopy();
      console.log('Controller: Enhanced copy completed, triggering refresh');
      
      // Trigger tasks refresh on successful copy
      if (onTasksRefresh) {
        onTasksRefresh();
      }
    } catch (error) {
      console.error('Controller: Enhanced copy operation failed:', error);
      // Error is already handled by the dialog hook, just log here
    }
  };

  // Enhanced reset with feature flag support
  const onReset = () => {
    console.log('Controller: Resetting copy state with enhanced cleanup');
    resetDialog();
    
    // Trigger refresh on reset to ensure UI is up to date
    if (onTasksRefresh) {
      onTasksRefresh();
    }
  };

  // Enhanced next handler with step validation
  const onNext = () => {
    if (ENABLE_SIX_STEP_WORKFLOW && requiresValidation(currentStep)) {
      const isValid = validateStepProgression(currentStep);
      if (!isValid) {
        console.warn('Controller: Step validation failed for:', currentStep);
        return;
      }
    }
    
    handleNext();
  };

  // Enhanced canGoNext with feature flag support
  const enhancedCanGoNext = ENABLE_SIX_STEP_WORKFLOW 
    ? validateStepProgression(currentStep) 
    : canGoNext;

  return {
    copySteps,
    currentStep,
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    availableClients,
    isClientsLoading,
    isProcessing,
    isSuccess,
    onSelectSourceClient: handleSelectSourceClient,
    onSelectTargetClient: handleSelectTargetClient,
    onBack: handleBack,
    onNext,
    onExecuteCopy,
    onReset,
    canGoNext: enhancedCanGoNext,
    getSourceClientName,
    getTargetClientName,
    
    // Enhanced features
    requiresValidation: (step: typeof currentStep) => ENABLE_SIX_STEP_WORKFLOW ? requiresValidation(step) : false,
    getStepDescription: (step: typeof currentStep) => ENABLE_SIX_STEP_WORKFLOW ? getStepDescription(step) : '',
    isEnhancedWorkflowEnabled: ENABLE_SIX_STEP_WORKFLOW,
    validateStepProgression
  };
};
