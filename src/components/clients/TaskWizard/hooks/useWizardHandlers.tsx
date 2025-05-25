
import React from 'react';
import { WizardAction, WizardStep } from '../types';
import { assignTemplatesToClients } from '@/services/templateAssignmentService';
import { AssignmentConfig } from '../AssignmentConfiguration';

interface UseWizardHandlersProps {
  selectedAction: WizardAction | null;
  setCurrentStep: (step: WizardStep) => void;
  setTargetClientId: (id: string) => void;
  handleCopySelectClient: (clientId: string) => void;
  setIsAssignmentProcessing: (processing: boolean) => void;
  setAssignmentSuccess: (success: boolean) => void;
  selectedTemplateIds: string[];
  selectedClientIds: string[];
  assignmentConfig: AssignmentConfig;
}

export const useWizardHandlers = ({
  selectedAction,
  setCurrentStep,
  setTargetClientId,
  handleCopySelectClient,
  setIsAssignmentProcessing,
  setAssignmentSuccess,
  selectedTemplateIds,
  selectedClientIds,
  assignmentConfig
}: UseWizardHandlersProps) => {
  const handleActionSelect = React.useCallback((action: WizardAction) => {
    if (action === 'copy-from-client') {
      setCurrentStep('client-selection');
    } else if (action === 'template-assignment') {
      setCurrentStep('task-selection');
    } else if (action === 'template-builder') {
      setCurrentStep('task-selection');
    } else {
      setCurrentStep('client-selection');
    }
  }, [setCurrentStep]);

  const handleClientSelect = React.useCallback((clientId: string) => {
    setTargetClientId(clientId);
    if (selectedAction === 'copy-from-client') {
      handleCopySelectClient(clientId);
      setCurrentStep('task-selection');
    }
  }, [selectedAction, setTargetClientId, handleCopySelectClient, setCurrentStep]);

  const handleTemplateAssignmentExecute = React.useCallback(async () => {
    setIsAssignmentProcessing(true);
    setCurrentStep('processing');

    try {
      for (const templateId of selectedTemplateIds) {
        await assignTemplatesToClients({
          templateId,
          clientIds: selectedClientIds,
          config: assignmentConfig
        });
      }
      
      setAssignmentSuccess(true);
      setCurrentStep('success');
    } catch (error) {
      console.error('Template assignment failed:', error);
    } finally {
      setIsAssignmentProcessing(false);
    }
  }, [
    selectedTemplateIds,
    selectedClientIds,
    assignmentConfig,
    setIsAssignmentProcessing,
    setAssignmentSuccess,
    setCurrentStep
  ]);

  const handleTemplateCreated = React.useCallback((templateData: any) => {
    console.log('Template created:', templateData);
    setCurrentStep('success');
  }, [setCurrentStep]);

  return {
    handleActionSelect,
    handleClientSelect,
    handleTemplateAssignmentExecute,
    handleTemplateCreated
  };
};
