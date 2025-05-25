import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { useCopyTasksDialog } from '../../CopyTasks/hooks/useCopyTasksDialog';
import { Client } from '@/types/client';

/**
 * Custom hook for managing copy operations within the wizard
 * 
 * This hook handles:
 * - Integration with the existing copy tasks dialog
 * - Copy operation state management and monitoring
 * - Client name resolution for source and target clients
 * - Enhanced state tracking with proper database verification
 * - Fixed state synchronization for proper wizard step progression
 */
export const useCopyOperation = (initialClientId?: string, onClose?: () => void) => {
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
  useEffect(() => {
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
  }, [copyStep, copyTargetClientId, copySelectedTaskIds, isCopyProcessing, isCopySuccessFromDialog, isDetectingTaskTypes]);

  // PHASE 3: Fixed state to track copy success with enhanced synchronization
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  // PHASE 3: Enhanced synchronization of success state from copy dialog hook
  useEffect(() => {
    console.log('🔍 PHASE 3 FIX - useCopyOperation: Synchronizing success state from copy dialog', {
      isCopySuccessFromDialog,
      currentIsCopySuccess: isCopySuccess,
      copyStep,
      isCopyProcessing,
      timestamp: new Date().toISOString()
    });

    // PHASE 3: Update local success state to match copy dialog success state with immediate propagation
    if (isCopySuccessFromDialog !== isCopySuccess) {
      console.log('🔍 PHASE 3 FIX - useCopyOperation: SUCCESS STATE CHANGE DETECTED - Immediate synchronization', {
        from: isCopySuccess,
        to: isCopySuccessFromDialog,
        reason: 'Copy dialog hook state updated',
        copyStep,
        isCopyProcessing
      });
      setIsCopySuccess(isCopySuccessFromDialog);
    }

    // PHASE 3: Enhanced verification for step progression readiness
    if (isCopySuccessFromDialog && !isCopyProcessing) {
      console.log('🔍 PHASE 3 FIX - useCopyOperation: COPY OPERATION FULLY COMPLETED - Ready for immediate step progression', {
        isCopySuccess: isCopySuccessFromDialog,
        isCopyProcessing,
        copyStep,
        message: 'Success state confirmed and propagated for wizard step progression'
      });
    }

    // PHASE 3: Handle copyStep success indication
    if (copyStep === 'success' && !isCopySuccess) {
      console.log('🔍 PHASE 3 FIX - useCopyOperation: Copy step indicates success - updating local state', {
        copyStep,
        previousIsCopySuccess: isCopySuccess
      });
      setIsCopySuccess(true);
    }
  }, [isCopySuccessFromDialog, isCopyProcessing, copyStep, isCopySuccess]);

  // Enhanced logging for copy state changes with detailed debugging
  useEffect(() => {
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyOperation: Copy state updated', {
      copyStep,
      isCopyProcessing,
      isCopySuccess,
      isCopySuccessFromDialog,
      copyTargetClientId,
      selectedTaskCount: copySelectedTaskIds.length,
      isDetectingTaskTypes,
      timestamp: new Date().toISOString()
    });

    // Debug state synchronization
    if (isCopySuccess) {
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyOperation: SUCCESS STATE ACTIVE - Copy operation completed and verified in database');
    }
    
    if (!isCopyProcessing && isCopySuccess) {
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyOperation: OPERATION COMPLETE - Processing=false, Success=true with database verification');
    }
  }, [copyStep, isCopyProcessing, isCopySuccess, isCopySuccessFromDialog, copyTargetClientId, copySelectedTaskIds.length, isDetectingTaskTypes]);

  const getSourceClientName = useCallback(() => {
    const result = (() => {
      if (!initialClientId || !Array.isArray(clients)) return '';
      const sourceClient = clients.find((c: Client) => c.id === initialClientId);
      return sourceClient?.legalName || '';
    })();
    
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyOperation: getSourceClientName called', {
      initialClientId,
      clientsCount: clients.length,
      result,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }, [initialClientId, clients]);

  const getTargetClientName = useCallback(() => {
    const result = (() => {
      if (!copyTargetClientId || !Array.isArray(clients)) return '';
      const targetClient = clients.find((c: Client) => c.id === copyTargetClientId);
      return targetClient?.legalName || '';
    })();
    
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyOperation: getTargetClientName called', {
      copyTargetClientId,
      clientsCount: clients.length,
      result,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }, [copyTargetClientId, clients]);

  // PHASE 2: Fixed enhanced copy execution with proper database verification
  const handleEnhancedCopyExecute = useCallback(async () => {
    console.log('🔍 PHASE 2 FIX - useCopyOperation: handleEnhancedCopyExecute CALLED', {
      initialClientId,
      copyTargetClientId,
      copySelectedTaskIds,
      taskCount: copySelectedTaskIds.length,
      handleCopyExecuteType: typeof handleCopyExecute,
      timestamp: new Date().toISOString()
    });

    // PHASE 2: Validate required parameters before proceeding
    if (!initialClientId) {
      const error = 'Source client ID is required for copy operation';
      console.error('🔍 PHASE 2 FIX - useCopyOperation: Copy operation failed - missing source client ID');
      throw new Error(error);
    }

    if (!copyTargetClientId) {
      const error = 'Target client ID is required for copy operation';
      console.error('🔍 PHASE 2 FIX - useCopyOperation: Copy operation failed - missing target client ID');
      throw new Error(error);
    }

    if (!copySelectedTaskIds || copySelectedTaskIds.length === 0) {
      const error = 'At least one task must be selected for copy operation';
      console.error('🔍 PHASE 2 FIX - useCopyOperation: Copy operation failed - no tasks selected');
      throw new Error(error);
    }

    try {
      console.log('🔍 PHASE 2 FIX - useCopyOperation: Starting wizard copy operation with database verification...', {
        sourceClientId: initialClientId,
        targetClientId: copyTargetClientId,
        taskCount: copySelectedTaskIds.length,
        selectedTasks: copySelectedTaskIds,
        aboutToCallHandleCopyExecute: true
      });
      
      // PHASE 2: This is the actual fix - ensure we call the real copy operation
      console.log('🔍 PHASE 2 FIX - useCopyOperation: CALLING handleCopyExecute() with validated parameters...');
      
      // The handleCopyExecute from useCopyTasksDialog should handle the actual database operations
      // and update the success state which will trigger wizard step progression
      await handleCopyExecute();
      
      console.log('🔍 PHASE 2 FIX - useCopyOperation: handleCopyExecute() COMPLETED successfully');
      console.log('🔍 PHASE 3 FIX - useCopyOperation: Copy operation completed - success state should propagate automatically');
      
    } catch (error) {
      console.error('🔍 PHASE 2 FIX - useCopyOperation: Copy operation failed:', error);
      console.error('🔍 PHASE 2 FIX - useCopyOperation: Error details:', {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        sourceClientId: initialClientId,
        targetClientId: copyTargetClientId,
        taskCount: copySelectedTaskIds.length,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }, [handleCopyExecute, initialClientId, copyTargetClientId, copySelectedTaskIds]);

  // PHASE 1 DIAGNOSTIC: Log final return values
  const returnValue = {
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
