
import { useState } from 'react';
import { AssignmentConfig } from '../../../TaskWizard/AssignmentConfiguration';
import { OperationProgress, OperationResults } from '../utils/progressTracker';

/**
 * Hook for managing assignment operation state
 */
export const useAssignmentState = () => {
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [assignmentConfig, setAssignmentConfig] = useState<AssignmentConfig>({
    taskType: 'adhoc',
    priority: 'Medium',
    preserveEstimatedHours: true,
    preserveSkills: true,
    generateImmediately: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OperationProgress | null>(null);
  const [operationResults, setOperationResults] = useState<OperationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setSelectedTemplateIds([]);
    setSelectedClientIds([]);
    setAssignmentConfig({
      taskType: 'adhoc',
      priority: 'Medium',
      preserveEstimatedHours: true,
      preserveSkills: true,
      generateImmediately: false
    });
    setIsProcessing(false);
    setProgress(null);
    setOperationResults(null);
    setError(null);
  };

  return {
    selectedTemplateIds,
    setSelectedTemplateIds,
    selectedClientIds,
    setSelectedClientIds,
    assignmentConfig,
    setAssignmentConfig,
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    operationResults,
    setOperationResults,
    error,
    setError,
    resetState
  };
};
