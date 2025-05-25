
import { useCallback } from 'react';

/**
 * Hook for enhanced copy execution with comprehensive error handling
 * 
 * This hook wraps the base copy execution with additional validation,
 * logging, and error handling to ensure reliable operation within the wizard.
 * 
 * IMPORTANT: This now delegates to the base copy handler to ensure proper
 * state machine transitions in the copy dialog.
 */
export const useCopyExecution = (
  baseCopyExecute: () => Promise<void>,
  sourceClientId?: string,
  targetClientId?: string | null,
  selectedTaskIds?: string[]
) => {
  const handleEnhancedCopyExecute = useCallback(async () => {
    // Validate required parameters
    if (!sourceClientId || !targetClientId || !selectedTaskIds?.length) {
      const missingParams = [];
      if (!sourceClientId) missingParams.push('sourceClientId');
      if (!targetClientId) missingParams.push('targetClientId');
      if (!selectedTaskIds?.length) missingParams.push('selectedTaskIds');
      
      console.error('Copy execution failed - missing required parameters:', missingParams);
      throw new Error(`Cannot execute copy: missing ${missingParams.join(', ')}`);
    }

    console.log('Starting enhanced copy execution', {
      sourceClientId,
      targetClientId,
      taskCount: selectedTaskIds.length
    });

    try {
      // CRITICAL: Use the base copy handler which properly manages the copy dialog's
      // state machine transitions (select-tasks → processing → success)
      // This ensures copyStep and isCopySuccess are updated correctly
      await baseCopyExecute();
      console.log('Copy execution completed successfully - state machine updated');
    } catch (error) {
      console.error('Copy execution failed:', error);
      throw error;
    }
  }, [baseCopyExecute, sourceClientId, targetClientId, selectedTaskIds]);

  return {
    handleEnhancedCopyExecute
  };
};
