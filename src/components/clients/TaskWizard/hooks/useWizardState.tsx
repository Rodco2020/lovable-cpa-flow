
import { useState, useEffect } from 'react';
import { useWizard } from '../WizardContext';
import { AssignmentConfig } from '../AssignmentConfiguration';

/**
 * Custom hook for managing wizard state including template assignment and processing states
 * 
 * This hook centralizes state management for:
 * - Template selection and assignment configuration
 * - Assignment processing status and success states
 * - Client selection for bulk operations
 */
export const useWizardState = (initialClientId?: string) => {
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
    customizePerClient: false,
    taskType: 'adhoc',
    priority: 'Medium',
    preserveEstimatedHours: true,
    preserveSkills: true,
    generateImmediately: false
  });
  const [isAssignmentProcessing, setIsAssignmentProcessing] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Set initial target client ID once
  useEffect(() => {
    if (initialClientId && !targetClientId) {
      console.log('TaskAssignmentWizard: Setting initial targetClientId:', initialClientId);
      setTargetClientId(initialClientId);
    }
  }, [initialClientId, targetClientId, setTargetClientId]);

  return {
    // Context state
    currentStep,
    selectedAction,
    setCurrentStep,
    targetClientId,
    setTargetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    
    // Local state
    selectedTemplateIds,
    setSelectedTemplateIds,
    selectedClientIds,
    setSelectedClientIds,
    assignmentConfig,
    setAssignmentConfig,
    isAssignmentProcessing,
    setIsAssignmentProcessing,
    assignmentSuccess,
    setAssignmentSuccess
  };
};
