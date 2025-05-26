
import { useTemplatesData } from './data/useTemplatesData';
import { useClientsData } from './data/useClientsData';
import { useAssignmentState } from './state/useAssignmentState';
import { validateTemplateAssignmentSelection } from './utils/validationUtils';
import { executeTemplateAssignment } from './utils/assignmentExecutor';
import { toast } from '@/hooks/use-toast';

/**
 * Main hook for template assignment functionality
 * Combines data fetching, state management, and business logic
 */
export const useTemplateAssignment = () => {
  // Data fetching
  const { 
    data: availableTemplates = [], 
    isLoading: isTemplatesLoading 
  } = useTemplatesData();

  const { 
    data: availableClients = [], 
    isLoading: isClientsLoading 
  } = useClientsData();

  // State management
  const {
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
  } = useAssignmentState();

  /**
   * Validates current selection
   */
  const validateSelection = (): string[] => {
    return validateTemplateAssignmentSelection(selectedTemplateIds, selectedClientIds);
  };

  /**
   * Executes the template assignment operation
   */
  const executeAssignment = async (): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setError(null);
      setOperationResults(null);

      const results = await executeTemplateAssignment(
        selectedTemplateIds,
        selectedClientIds,
        assignmentConfig,
        availableTemplates,
        setProgress
      );

      setOperationResults(results);
      return results.success;

    } catch (error) {
      console.error('Assignment execution failed:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Assignment Failed",
        description: "An unexpected error occurred during assignment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Resets the entire operation state
   */
  const resetOperation = () => {
    resetState();
  };

  return {
    // Template selection
    selectedTemplateIds,
    setSelectedTemplateIds,
    availableTemplates,
    isTemplatesLoading,
    
    // Client selection
    selectedClientIds,
    setSelectedClientIds,
    availableClients,
    isClientsLoading,
    
    // Configuration
    assignmentConfig,
    setAssignmentConfig,
    
    // Processing
    isProcessing,
    progress,
    operationResults,
    error,
    
    // Actions
    executeAssignment,
    resetOperation,
    validateSelection
  };
};
