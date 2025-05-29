
import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';
import { useCopyTasksDialog } from '../../CopyTasks/hooks/useCopyTasksDialog';
import { CopyTabStep } from './useCopyTabSteps';

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
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  handleSelectTargetClient: (clientId: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleCopy: () => Promise<void>;
  resetDialog: () => void;
}

export const useCopyTabState = (
  initialClientId: string,
  onClose?: () => void
): CopyTabStateReturn => {
  const [currentStep, setCurrentStep] = useState<CopyTabStep>('selection');

  // Fetch available clients for selection
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  // Filter out the source client from available clients and ensure only active clients
  const availableClients = Array.isArray(clients) ? clients.filter((client: Client) => 
    client.id !== initialClientId && client.status === 'Active'
  ) : [];

  // Use the existing copy tasks dialog hook
  const {
    step: dialogStep,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    resetDialog
  } = useCopyTasksDialog(initialClientId, onClose);

  // Sync dialog step with our local step state
  useEffect(() => {
    switch (dialogStep) {
      case 'select-target-client':
        setCurrentStep('selection');
        break;
      case 'select-tasks':
        setCurrentStep('task-selection');
        break;
      case 'confirm':
        setCurrentStep('confirmation');
        break;
      case 'processing':
        setCurrentStep('processing');
        break;
      case 'success':
        setCurrentStep('complete');
        break;
      default:
        setCurrentStep('selection');
    }
  }, [dialogStep]);

  const getSourceClientName = useCallback(() => {
    if (!initialClientId) return '';
    const sourceClient = clients.find((c: Client) => c.id === initialClientId);
    return sourceClient?.legalName || '';
  }, [initialClientId, clients]);

  const getTargetClientName = useCallback(() => {
    if (!targetClientId) return '';
    const targetClient = clients.find((c: Client) => c.id === targetClientId);
    return targetClient?.legalName || '';
  }, [targetClientId, clients]);

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 'selection':
        return !!targetClientId;
      case 'task-selection':
        return selectedTaskIds.length > 0;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  }, [currentStep, targetClientId, selectedTaskIds.length]);

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
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    resetDialog
  };
};
