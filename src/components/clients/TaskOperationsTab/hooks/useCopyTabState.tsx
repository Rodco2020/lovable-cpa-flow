
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
  
  // Dialog state - now delegated to useCopyTasksDialog
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

export const useCopyTabState = (
  initialClientId: string,
  onClose?: () => void
): CopyTabStateReturn => {
  const [currentStep, setCurrentStep] = useState<CopyTabStep>('select-source-client');

  // Fetch available clients for selection
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  // Filter out the source client from available clients and ensure only active clients
  const availableClients = Array.isArray(clients) ? clients.filter((client: Client) => 
    client.id !== initialClientId && client.status === 'Active'
  ) : [];

  // Use the refactored copy tasks dialog hook - this is our primary state manager now
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
  } = useCopyTasksDialog(undefined, onClose); // Don't auto-select source, we'll handle it explicitly

  // Sync dialog step with our local step state using the mapping
  useEffect(() => {
    const mappedStep = mapDialogStepToCopyTabStep(dialogStep as any);
    setCurrentStep(mappedStep);
  }, [dialogStep]);

  // Auto-select the initial client as source when component mounts
  useEffect(() => {
    if (initialClientId && !sourceClientId) {
      console.log('Auto-selecting initial client as source:', initialClientId);
      dialogHandleSelectSourceClient(initialClientId);
    }
  }, [initialClientId, sourceClientId, dialogHandleSelectSourceClient]);

  // Enhanced client name getters with client data resolution
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

  // Enhanced event handlers that properly delegate to the dialog hook
  const handleSelectSourceClient = useCallback((clientId: string) => {
    console.log('Tab: Selecting source client:', clientId);
    dialogHandleSelectSourceClient(clientId);
  }, [dialogHandleSelectSourceClient]);

  const handleSelectTargetClient = useCallback((clientId: string) => {
    console.log('Tab: Selecting target client:', clientId);
    dialogHandleSelectTargetClient(clientId);
  }, [dialogHandleSelectTargetClient]);

  const handleBack = useCallback(() => {
    console.log('Tab: Going back from step:', currentStep);
    dialogHandleBack();
  }, [dialogHandleBack, currentStep]);

  const handleNext = useCallback(() => {
    console.log('Tab: Going next from step:', currentStep);
    dialogHandleNext();
  }, [dialogHandleNext, currentStep]);

  const handleCopy = useCallback(async () => {
    console.log('Tab: Executing copy operation');
    try {
      await dialogHandleCopy();
      console.log('Tab: Copy operation completed successfully');
    } catch (error) {
      console.error('Tab: Copy operation failed:', error);
      throw error; // Re-throw to allow caller to handle
    }
  }, [dialogHandleCopy]);

  const resetDialog = useCallback(() => {
    console.log('Tab: Resetting dialog state');
    dialogResetDialog();
    // Reset local step state as well
    setCurrentStep('select-source-client');
  }, [dialogResetDialog]);

  // Use the dialog's canGoNext logic as our source of truth
  const canGoNext = dialogCanGoNext;

  return {
    currentStep,
    setCurrentStep,
    availableClients,
    isClientsLoading,
    getSourceClientName,
    getTargetClientName,
    canGoNext,
    
    // Dialog state - now properly delegated
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
