
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
  canGoNext: () => boolean;
  
  // Dialog state
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

  // Use the existing copy tasks dialog hook with the initial client as default source
  const {
    step: dialogStep,
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
  } = useCopyTasksDialog(initialClientId, onClose);

  // Sync dialog step with our local step state using the mapping
  useEffect(() => {
    const mappedStep = mapDialogStepToCopyTabStep(dialogStep as any);
    setCurrentStep(mappedStep);
  }, [dialogStep]);

  // Auto-select the initial client as source when component mounts
  useEffect(() => {
    if (initialClientId && !sourceClientId) {
      handleSelectSourceClient(initialClientId);
    }
  }, [initialClientId, sourceClientId, handleSelectSourceClient]);

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

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 'select-source-client':
        return !!sourceClientId;
      case 'selection':
        return !!targetClientId;
      case 'task-selection':
        return selectedTaskIds.length > 0;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  }, [currentStep, sourceClientId, targetClientId, selectedTaskIds.length]);

  return {
    currentStep,
    setCurrentStep,
    availableClients,
    isClientsLoading,
    getSourceClientName,
    getTargetClientName,
    canGoNext,
    
    // Dialog state
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
