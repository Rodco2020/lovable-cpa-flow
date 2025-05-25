
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
 * - Enhanced state tracking for reliable step progression
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
    isSuccess: isCopySuccess,
    isDetectingTaskTypes
  } = useCopyTasksDialog(initialClientId || '', onClose || (() => {}));

  // Enhanced logging for copy state changes with detailed debugging
  useEffect(() => {
    console.log('useCopyOperation: Copy state updated', {
      copyStep,
      isCopyProcessing,
      isCopySuccess,
      copyTargetClientId,
      selectedTaskCount: copySelectedTaskIds.length,
      isDetectingTaskTypes,
      timestamp: new Date().toISOString()
    });

    // Debug state synchronization
    if (isCopySuccess) {
      console.log('useCopyOperation: SUCCESS STATE DETECTED - Copy operation completed successfully');
    }
    
    if (!isCopyProcessing && isCopySuccess) {
      console.log('useCopyOperation: BOTH CONDITIONS MET - Processing=false, Success=true');
    }
  }, [copyStep, isCopyProcessing, isCopySuccess, copyTargetClientId, copySelectedTaskIds.length, isDetectingTaskTypes]);

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

  // Enhanced copy execution with wizard-specific behavior
  const handleEnhancedCopyExecute = useCallback(async () => {
    try {
      console.log('useCopyOperation: Starting wizard copy operation...', {
        sourceClientId: initialClientId,
        targetClientId: copyTargetClientId,
        taskCount: copySelectedTaskIds.length
      });
      
      await handleCopyExecute();
      
      console.log('useCopyOperation: Copy operation completed successfully');
      console.log('useCopyOperation: Checking final states...', {
        isCopySuccess,
        isCopyProcessing
      });
    } catch (error) {
      console.error('useCopyOperation: Copy operation failed:', error);
      throw error;
    }
  }, [handleCopyExecute, initialClientId, copyTargetClientId, copySelectedTaskIds.length, isCopySuccess, isCopyProcessing]);

  return {
    // Client data
    clients,
    isClientsLoading,
    
    // Copy operation state with enhanced debugging
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
