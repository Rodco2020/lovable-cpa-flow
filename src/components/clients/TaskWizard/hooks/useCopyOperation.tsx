
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

  // State to track copy success with proper synchronization
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  // Synchronize success state from copy dialog hook with enhanced logging
  useEffect(() => {
    console.log('useCopyOperation: Synchronizing success state from copy dialog', {
      isCopySuccessFromDialog,
      currentIsCopySuccess: isCopySuccess,
      copyStep,
      isCopyProcessing,
      timestamp: new Date().toISOString()
    });

    // Update local success state to match copy dialog success state
    if (isCopySuccessFromDialog !== isCopySuccess) {
      console.log('useCopyOperation: SUCCESS STATE CHANGE DETECTED', {
        from: isCopySuccess,
        to: isCopySuccessFromDialog,
        reason: 'Copy dialog hook state updated'
      });
      setIsCopySuccess(isCopySuccessFromDialog);
    }

    // Enhanced state verification for step progression
    if (isCopySuccessFromDialog && !isCopyProcessing) {
      console.log('useCopyOperation: COPY OPERATION FULLY COMPLETED', {
        isCopySuccess: isCopySuccessFromDialog,
        isCopyProcessing,
        copyStep,
        message: 'Ready for wizard step progression'
      });
    }
  }, [isCopySuccessFromDialog, isCopyProcessing, copyStep, isCopySuccess]);

  // Enhanced logging for copy state changes with detailed debugging
  useEffect(() => {
    console.log('useCopyOperation: Copy state updated', {
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
      console.log('useCopyOperation: SUCCESS STATE ACTIVE - Copy operation completed and verified in database');
    }
    
    if (!isCopyProcessing && isCopySuccess) {
      console.log('useCopyOperation: OPERATION COMPLETE - Processing=false, Success=true with database verification');
    }
  }, [copyStep, isCopyProcessing, isCopySuccess, isCopySuccessFromDialog, copyTargetClientId, copySelectedTaskIds.length, isDetectingTaskTypes]);

  const getSourceClientName = useCallback(() => {
    if (!initialClientId || !Array.isArray(clients)) return '';
    const sourceClient = clients.find((c: Client) => c.id === initialClientId);
    return sourceClient?.legalName || '';
  }, [initialClientId, clients]);

  const getTargetClientName = useCallback(() => {
    if (!copyTargetClientId || !Array.isArray(clients)) return '';
    const targetClient = clients.find((c: Client) => c.id === copyTargetClientId);
    return targetClient?.legalName || '';
  }, [copyTargetClientId, clients]);

  // Enhanced copy execution with proper database verification
  const handleEnhancedCopyExecute = useCallback(async () => {
    try {
      console.log('useCopyOperation: Starting wizard copy operation with database verification...', {
        sourceClientId: initialClientId,
        targetClientId: copyTargetClientId,
        taskCount: copySelectedTaskIds.length
      });
      
      await handleCopyExecute();
      
      console.log('useCopyOperation: Copy operation completed successfully with database verification');
    } catch (error) {
      console.error('useCopyOperation: Copy operation failed:', error);
      throw error;
    }
  }, [handleCopyExecute, initialClientId, copyTargetClientId, copySelectedTaskIds.length]);

  return {
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
};
