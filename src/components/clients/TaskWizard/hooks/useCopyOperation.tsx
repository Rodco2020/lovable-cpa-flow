
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
 * - Enhanced copy execution with proper database verification
 * - Fixed state synchronization for proper wizard step progression
 * 
 * @param initialClientId - The source client ID to copy tasks from
 * @param onClose - Callback function to execute when copy operation completes
 * @returns Complete copy operation state and handlers
 */
export const useCopyOperation = (
  initialClientId?: string, 
  onClose?: () => void
): CopyOperationHookReturn => {
  // PHASE 1 DIAGNOSTIC: Log hook initialization
  console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyOperation: Hook initialized', {
    initialClientId,
    onCloseProvided: !!onClose,
    timestamp: new Date().toISOString()
  });

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
    handleSelectClient: handleCopySelectClient,
    handleCopy: handleCopyExecute,
    isProcessing: isCopyProcessing,
    isSuccess: isCopySuccessFromDialog,
    isDetectingTaskTypes
  } = useCopyTasksDialog(initialClientId || '', onClose || (() => {}));

  // PHASE 1 DIAGNOSTIC: Log copy dialog hook state
  console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyOperation: Copy dialog hook state', {
    copyStep,
    copyTargetClientId,
    copySelectedTaskIdsCount: copySelectedTaskIds.length,
    copySelectedTaskIds,
    isCopyProcessing,
    isCopySuccessFromDialog,
    isDetectingTaskTypes,
    timestamp: new Date().toISOString()
  });

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

  const { handleEnhancedCopyExecute } = useCopyExecution(
    handleCopyExecute,
    initialClientId,
    copyTargetClientId,
    copySelectedTaskIds
  );

  // PHASE 1 DIAGNOSTIC: Log final return values
  const returnValue: CopyOperationHookReturn = {
    // Client data
    clients,
    isClientsLoading,
    
    // Copy operation state with enhanced debugging and proper success state synchronization
    copyStep,
    copyTargetClientId,
    copySelectedTaskIds,
    setCopySelectedTaskIds,
    isCopyProcessing,
    isCopySuccess, // Now properly synchronized with copy dialog success state
    isDetectingTaskTypes,
    
    // Copy operation handlers
    handleCopySelectClient,
    handleEnhancedCopyExecute,
    getSourceClientName,
    getTargetClientName
  };

  console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyOperation: Returning hook values', {
    clientsCount: clients.length,
    isClientsLoading,
    copyStep,
    copyTargetClientId,
    copySelectedTaskIdsCount: copySelectedTaskIds.length,
    isCopyProcessing,
    isCopySuccess,
    isDetectingTaskTypes,
    handlersAvailable: {
      handleCopySelectClient: !!handleCopySelectClient,
      handleEnhancedCopyExecute: !!handleEnhancedCopyExecute,
      getSourceClientName: !!getSourceClientName,
      getTargetClientName: !!getTargetClientName
    },
    timestamp: new Date().toISOString()
  });

  return returnValue;
};
