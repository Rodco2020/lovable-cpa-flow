
import { useWizardHandlers } from './useWizardHandlers';
import { useWizardState } from './useWizardState';
import { useCopyOperation } from './useCopyOperation';
import { useCopySuccessMonitor } from './useCopySuccessMonitor';

/**
 * Main hook for Task Assignment Wizard functionality
 * 
 * This hook orchestrates all wizard operations by composing smaller, focused hooks:
 * - useWizardState: Manages wizard state and template assignment
 * - useCopyOperation: Handles copy operations and client data
 * - useCopySuccessMonitor: Monitors copy success and step transitions
 * - useWizardHandlers: Provides action handlers for wizard operations
 * 
 * The wizard supports multiple operations:
 * - Copy tasks from one client to another
 * - Assign templates to clients (single or bulk)
 * - Build new templates from existing tasks
 * 
 * @param initialClientId - Optional client ID to pre-select as source
 * @param onClose - Callback function to execute when wizard closes
 */
export const useTaskAssignmentWizard = (initialClientId?: string, onClose?: () => void) => {
  // PHASE 1 DIAGNOSTIC: Log main hook initialization
  console.log('🔍 PHASE 1 DIAGNOSTIC - useTaskAssignmentWizard: Main hook initialized', {
    initialClientId,
    onCloseProvided: !!onClose,
    timestamp: new Date().toISOString()
  });

  // Manage wizard state and template assignment
  const wizardState = useWizardState(initialClientId);
  
  // Handle copy operations and client data
  const copyOperation = useCopyOperation(initialClientId, onClose);
  
  // Monitor copy success and handle step transitions
  useCopySuccessMonitor(
    wizardState.currentStep,
    copyOperation.isCopySuccess,
    copyOperation.isCopyProcessing,
    copyOperation.copyStep,
    wizardState.setCurrentStep
  );

  // PHASE 1 DIAGNOSTIC: Log hook composition state
  console.log('🔍 PHASE 1 DIAGNOSTIC - useTaskAssignmentWizard: Hook composition state', {
    wizardCurrentStep: wizardState.currentStep,
    wizardSelectedAction: wizardState.selectedAction,
    copyIsCopySuccess: copyOperation.isCopySuccess,
    copyIsCopyProcessing: copyOperation.isCopyProcessing,
    copyCopyStep: copyOperation.copyStep,
    copyTargetClientId: copyOperation.copyTargetClientId,
    copySelectedTaskIdsCount: copyOperation.copySelectedTaskIds.length,
    timestamp: new Date().toISOString()
  });

  // Get wizard action handlers
  const {
    handleActionSelect,
    handleClientSelect,
    handleTemplateAssignmentExecute,
    handleTemplateCreated
  } = useWizardHandlers({
    selectedAction: wizardState.selectedAction,
    setCurrentStep: wizardState.setCurrentStep,
    setTargetClientId: wizardState.setTargetClientId,
    handleCopySelectClient: copyOperation.handleCopySelectClient,
    setIsAssignmentProcessing: wizardState.setIsAssignmentProcessing,
    setAssignmentSuccess: wizardState.setAssignmentSuccess,
    selectedTemplateIds: wizardState.selectedTemplateIds,
    selectedClientIds: wizardState.selectedClientIds,
    assignmentConfig: wizardState.assignmentConfig
  });

  // PHASE 1 DIAGNOSTIC: Log final wizard state before return
  const returnValue = {
    // Wizard state
    currentStep: wizardState.currentStep,
    selectedAction: wizardState.selectedAction,
    setCurrentStep: wizardState.setCurrentStep,
    
    // Client data
    clients: copyOperation.clients,
    isClientsLoading: copyOperation.isClientsLoading,
    
    // Template assignment state
    selectedTemplateIds: wizardState.selectedTemplateIds,
    setSelectedTemplateIds: wizardState.setSelectedTemplateIds,
    selectedClientIds: wizardState.selectedClientIds,
    setSelectedClientIds: wizardState.setSelectedClientIds,
    assignmentConfig: wizardState.assignmentConfig,
    setAssignmentConfig: wizardState.setAssignmentConfig,
    isAssignmentProcessing: wizardState.isAssignmentProcessing,
    assignmentSuccess: wizardState.assignmentSuccess,
    
    // Task selection state
    selectedTaskIds: wizardState.selectedTaskIds,
    setSelectedTaskIds: wizardState.setSelectedTaskIds,
    
    // Copy operation state
    copyTargetClientId: copyOperation.copyTargetClientId,
    copySelectedTaskIds: copyOperation.copySelectedTaskIds,
    setCopySelectedTaskIds: copyOperation.setCopySelectedTaskIds,
    copyStep: copyOperation.copyStep,
    isCopyProcessing: copyOperation.isCopyProcessing,
    
    // Action handlers
    handleActionSelect,
    handleClientSelect,
    handleTemplateAssignmentExecute,
    handleTemplateCreated,
    handleEnhancedCopyExecute: copyOperation.handleEnhancedCopyExecute,
    getSourceClientName: copyOperation.getSourceClientName,
    getTargetClientName: copyOperation.getTargetClientName
  };

  console.log('🔍 PHASE 1 DIAGNOSTIC - useTaskAssignmentWizard: Final wizard state', {
    currentStep: returnValue.currentStep,
    selectedAction: returnValue.selectedAction,
    clientsCount: returnValue.clients.length,
    isClientsLoading: returnValue.isClientsLoading,
    copyTargetClientId: returnValue.copyTargetClientId,
    copySelectedTaskIdsCount: returnValue.copySelectedTaskIds.length,
    copyStep: returnValue.copyStep,
    isCopyProcessing: returnValue.isCopyProcessing,
    handlersAvailable: {
      handleActionSelect: !!returnValue.handleActionSelect,
      handleClientSelect: !!returnValue.handleClientSelect,
      handleEnhancedCopyExecute: !!returnValue.handleEnhancedCopyExecute,
      getSourceClientName: !!returnValue.getSourceClientName,
      getTargetClientName: !!returnValue.getTargetClientName
    },
    timestamp: new Date().toISOString()
  });

  return returnValue;
};
