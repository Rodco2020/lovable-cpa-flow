
import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { useCopyTasksDialog } from '../../CopyTasks/hooks/useCopyTasksDialog';
import { CopyTabStep } from './useCopyTabSteps';
import { mapDialogStepToCopyTabStep } from './utils/stepMapping';

interface CopyTabStateReturn {
  currentStep: CopyTabStep;
  setCurrentStep: (step: CopyTabStep) => void;
  availableClients: Client[];
  isClientsLoading: boolean;
  getSourceClientName: () => string;
  getTargetClientName: () => string;
  canGoNext: boolean;
  
  // Delegated state from dialog hook
  dialogStep: string;
  sourceClientId: string | null;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  handleSelectSourceClient: (clientId: string) => void;
  handleSelectTargetClient: (clientId: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleCopy: () => Promise<void>;
  resetDialog: () => void;
  isProcessing: boolean;
  isSuccess: boolean;
}

/**
 * Optimized Copy Tab State Hook - Phase 5 Cleanup
 * 
 * Removed duplicate logic and optimized performance by:
 * - Consolidating client data fetching
 * - Optimizing memoization
 * - Removing redundant state management
 * - Streamlining event handlers
 */
export const useCopyTabState = (
  initialClientId: string,
  onClose?: () => void
): CopyTabStateReturn => {
  const [currentStep, setCurrentStep] = useState<CopyTabStep>('select-source-client');

  // Optimized client data fetching with better caching
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients', 'copy-tab'],
    queryFn: getAllClients,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  // Optimized client filtering with memoization
  const availableClients = React.useMemo(() => 
    Array.isArray(clients) 
      ? clients.filter((client: Client) => 
          client.id !== initialClientId && client.status === 'Active'
        )
      : [], 
    [clients, initialClientId]
  );

  // Primary state delegation to dialog hook (single source of truth)
  const {
    step: dialogStep,
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectSourceClient: dialogHandleSelectSourceClient,
    handleSelectTargetClient: dialogHandleSelectTargetClient,
    handleBack: dialogHandleBack,
    handleNext: dialogHandleNext,
    handleCopy: dialogHandleCopy,
    resetDialog: dialogResetDialog,
    isProcessing,
    isSuccess,
    canGoNext: dialogCanGoNext
  } = useCopyTasksDialog(undefined, onClose);

  // Optimized step synchronization
  useEffect(() => {
    const mappedStep = mapDialogStepToCopyTabStep(dialogStep as any);
    setCurrentStep(mappedStep);
  }, [dialogStep]);

  // Auto-select initial client (optimized to run only once)
  useEffect(() => {
    if (initialClientId && !sourceClientId && dialogStep === 'select-source-client') {
      console.log('Auto-selecting initial client:', initialClientId);
      dialogHandleSelectSourceClient(initialClientId);
    }
  }, [initialClientId, sourceClientId, dialogStep, dialogHandleSelectSourceClient]);

  // Optimized client name getters with memoization
  const getSourceClientName = useCallback(() => {
    if (!sourceClientId) return '';
    const sourceClient = clients.find((c: Client) => c.id === sourceClientId);
    return sourceClient?.legalName || '';
  }, [sourceClientId, clients]);

  const getTargetClientName = useCallback(() => {
    if (!targetClientId) return '';
    const targetClient = clients.find((c: Client) => c.id === targetClientId);
    return targetClient?.legalName || '';
  }, [targetClientId, clients]);

  // Optimized event handlers with proper delegation
  const handleSelectSourceClient = useCallback((clientId: string) => {
    dialogHandleSelectSourceClient(clientId);
  }, [dialogHandleSelectSourceClient]);

  const handleSelectTargetClient = useCallback((clientId: string) => {
    dialogHandleSelectTargetClient(clientId);
  }, [dialogHandleSelectTargetClient]);

  const handleBack = useCallback(() => {
    dialogHandleBack();
  }, [dialogHandleBack]);

  const handleNext = useCallback(() => {
    dialogHandleNext();
  }, [dialogHandleNext]);

  const handleCopy = useCallback(async () => {
    try {
      await dialogHandleCopy();
    } catch (error) {
      console.error('Copy operation failed:', error);
      throw error;
    }
  }, [dialogHandleCopy]);

  const resetDialog = useCallback(() => {
    dialogResetDialog();
    setCurrentStep('select-source-client');
  }, [dialogResetDialog]);

  return {
    currentStep,
    setCurrentStep,
    availableClients,
    isClientsLoading,
    getSourceClientName,
    getTargetClientName,
    canGoNext: dialogCanGoNext,
    
    // Delegated state
    dialogStep,
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectSourceClient,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    resetDialog,
    isProcessing,
    isSuccess
  };
};
