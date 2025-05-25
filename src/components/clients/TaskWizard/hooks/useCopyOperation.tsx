
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
    isSuccess: isCopySuccess
  } = useCopyTasksDialog(initialClientId || '', onClose || (() => {}));

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

  // Enhanced copy execution with improved logging
  const handleEnhancedCopyExecute = useCallback(async () => {
    try {
      console.log('TaskAssignmentWizard: Starting enhanced copy operation...');
      await handleCopyExecute();
      console.log('TaskAssignmentWizard: Copy operation completed, waiting for success state...');
    } catch (error) {
      console.error('TaskAssignmentWizard: Copy operation failed:', error);
      throw error;
    }
  }, [handleCopyExecute]);

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
    
    // Copy operation handlers
    handleCopySelectClient,
    handleEnhancedCopyExecute,
    getSourceClientName,
    getTargetClientName
  };
};
