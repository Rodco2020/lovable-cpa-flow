
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { useCopyTasksDialog } from '../../CopyTasks/hooks/useCopyTasksDialog';
import { useCopyState } from './useCopyState';
import { useClientNames } from './useClientNames';
import { useCopyExecution } from './useCopyExecution';
import { CopyOperationHookReturn } from './types';

/**
 * Main hook for managing copy operations within the wizard
 * 
 * This hook orchestrates copy operations by coordinating between:
 * - The existing copy tasks dialog functionality
 * - Copy operation state management and monitoring
 * - Client name resolution for source and target clients
 * - Enhanced copy execution with proper state machine management
 * 
 * @param initialClientId - The source client ID to copy tasks from
 * @param onClose - Callback function to execute when copy operation completes
 * @returns Complete copy operation state and handlers
 */
export const useCopyOperation = (
  initialClientId?: string, 
  onClose?: () => void
): CopyOperationHookReturn => {
  // Fetch clients for enhanced browser
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  // Use the existing copy dialog hook for copy operations
  const {
    step: copyStep,
    targetClientId: copyTargetClientId,
    selectedTaskIds: copySelectedTaskIds,
    setSelectedTaskIds: setCopySelectedTaskIds,
    handleSelectTargetClient: handleCopySelectClient,
    handleCopy: handleCopyExecute,
    isProcessing: isCopyProcessing,
    isSuccess: isCopySuccessFromDialog,
    isDetectingTaskTypes
  } = useCopyTasksDialog(initialClientId || '', onClose || (() => {}));

  // Use specialized hooks for different concerns
  const { isCopySuccess } = useCopyState(
    isCopySuccessFromDialog,
    isCopyProcessing,
    copyStep
  );

  const { getSourceClientName, getTargetClientName } = useClientNames(
    clients,
    initialClientId,
    copyTargetClientId
  );

  // CRITICAL: Use the base copy handler (handleCopyExecute) which properly
  // manages the copy dialog's state machine transitions. This ensures
  // copyStep progresses through: select-tasks → processing → success
  const { handleEnhancedCopyExecute } = useCopyExecution(
    handleCopyExecute, // This is the key - use the dialog's state-managing handler
    initialClientId,
    copyTargetClientId,
    copySelectedTaskIds
  );

  return {
    // Client data
    clients,
    isClientsLoading,
    
    // Copy operation state
    copyStep,
    copyTargetClientId,
    copySelectedTaskIds,
    setCopySelectedTaskIds,
    isCopyProcessing,
    isCopySuccess,
    isDetectingTaskTypes,
    
    // Copy operation handlers
    handleCopySelectClient,
    handleEnhancedCopyExecute,
    getSourceClientName,
    getTargetClientName
  };
};
