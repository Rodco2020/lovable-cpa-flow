
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { useCopyTasksDialog } from '../../CopyTasks/hooks/useCopyTasksDialog';
import { useWizard } from '../WizardContext';
import { useWizardHandlers } from './useWizardHandlers';
import { AssignmentConfig } from '../AssignmentConfiguration';
import { Client } from '@/types/client';

export const useTaskAssignmentWizard = (initialClientId?: string, onClose?: () => void) => {
  const { 
    currentStep, 
    selectedAction, 
    setCurrentStep,
    targetClientId,
    setTargetClientId,
    selectedTaskIds,
    setSelectedTaskIds 
  } = useWizard();
  
  // Template assignment state
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [assignmentConfig, setAssignmentConfig] = useState<AssignmentConfig>({
    assignmentType: 'ad-hoc',
    customizePerClient: false
  });
  const [isAssignmentProcessing, setIsAssignmentProcessing] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

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

  // Set initial target client ID once
  useEffect(() => {
    if (initialClientId && !targetClientId) {
      console.log('TaskAssignmentWizard: Setting initial targetClientId:', initialClientId);
      setTargetClientId(initialClientId);
    }
  }, [initialClientId, targetClientId, setTargetClientId]);

  // Enhanced copy success monitoring with detailed logging
  useEffect(() => {
    console.log('TaskAssignmentWizard: State check - currentStep:', currentStep, 'isCopySuccess:', isCopySuccess, 'isCopyProcessing:', isCopyProcessing);
    
    if (isCopySuccess && currentStep === 'processing' && !isCopyProcessing) {
      console.log('TaskAssignmentWizard: Copy operation completed successfully, transitioning to success step');
      setCurrentStep('success');
    }
  }, [isCopySuccess, currentStep, isCopyProcessing, setCurrentStep]);

  const {
    handleActionSelect,
    handleClientSelect,
    handleTemplateAssignmentExecute,
    handleTemplateCreated
  } = useWizardHandlers({
    selectedAction,
    setCurrentStep,
    setTargetClientId,
    handleCopySelectClient,
    setIsAssignmentProcessing,
    setAssignmentSuccess,
    selectedTemplateIds,
    selectedClientIds,
    assignmentConfig
  });

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
      setCurrentStep('processing');
      await handleCopyExecute();
      console.log('TaskAssignmentWizard: Copy operation completed, waiting for success state...');
    } catch (error) {
      console.error('TaskAssignmentWizard: Copy operation failed:', error);
      setCurrentStep('confirmation');
    }
  }, [handleCopyExecute, setCurrentStep]);

  return {
    // State
    currentStep,
    selectedAction,
    clients,
    isClientsLoading,
    selectedTemplateIds,
    setSelectedTemplateIds,
    selectedClientIds,
    setSelectedClientIds,
    assignmentConfig,
    setAssignmentConfig,
    isAssignmentProcessing,
    assignmentSuccess,
    selectedTaskIds,
    setSelectedTaskIds,
    copyTargetClientId,
    copySelectedTaskIds,
    setCopySelectedTaskIds,
    copyStep,
    isCopyProcessing,
    
    // Handlers
    handleActionSelect,
    handleClientSelect,
    handleTemplateAssignmentExecute,
    handleTemplateCreated,
    handleEnhancedCopyExecute,
    getSourceClientName,
    getTargetClientName,
    
    // Context methods
    setCurrentStep
  };
};
