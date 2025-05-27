
import { useState } from 'react';
import { AssignmentConfig } from '../../../TaskWizard/AssignmentConfiguration';
import { OperationProgress, OperationResults, createInitialProgress } from '../utils/progressTracker';

/**
 * Hook for managing assignment operation state
 */
export const useAssignmentState = () => {
  // Template selection state
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  
  // Client selection state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  
  // Configuration state
  const [assignmentConfig, setAssignmentConfig] = useState<AssignmentConfig>({
    assignmentType: 'ad-hoc',
    customizePerClient: false,
    taskType: 'adhoc',
    priority: 'Medium',
    preserveEstimatedHours: true,
    preserveSkills: true,
    generateImmediately: false
  });
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OperationProgress>(createInitialProgress(0));
  const [operationResults, setOperationResults] = useState<OperationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setSelectedTemplateIds([]);
    setSelectedClientIds([]);
    setAssignmentConfig({
      assignmentType: 'ad-hoc',
      customizePerClient: false,
      taskType: 'adhoc',
      priority: 'Medium',
      preserveEstimatedHours: true,
      preserveSkills: true,
      generateImmediately: false
    });
    setIsProcessing(false);
    setProgress(createInitialProgress(0));
    setOperationResults(null);
    setError(null);
  };

  return {
    // Template selection
    selectedTemplateIds,
    setSelectedTemplateIds,
    
    // Client selection
    selectedClientIds,
    setSelectedClientIds,
    
    // Configuration
    assignmentConfig,
    setAssignmentConfig,
    
    // Processing state
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    operationResults,
    setOperationResults,
    error,
    setError,
    
    // Actions
    resetState
  };
};
