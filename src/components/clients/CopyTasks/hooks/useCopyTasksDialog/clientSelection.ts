
import { useCallback } from 'react';
import { useValidation } from './validation';

/**
 * Client selection handlers for the copy tasks dialog
 */
export const useClientSelection = (
  sourceClientId: string | null,
  setSourceClientId: (id: string | null) => void,
  setTargetClientId: (id: string | null) => void,
  setValidationErrors: (errors: string[]) => void,
  performanceLogger: any
) => {
  const { validateSourceClient, validateTargetClient } = useValidation();

  const handleSelectSourceClient = useCallback((clientId: string) => {
    performanceLogger.startTiming('source-client-selection');
    
    const errors = validateSourceClient(clientId);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setSourceClientId(clientId);
      console.log('Source client selected:', clientId);
      // No auto-advance - user must manually proceed to next step
    }
    
    performanceLogger.logPerformance('source-client-selection', performanceLogger.endTiming('source-client-selection'));
  }, [validateSourceClient, performanceLogger, setSourceClientId, setValidationErrors]);

  const handleSelectTargetClient = useCallback((clientId: string) => {
    performanceLogger.startTiming('target-client-selection');
    
    if (!sourceClientId) {
      setValidationErrors(['Source client must be selected first']);
      return;
    }

    const errors = validateTargetClient(clientId, sourceClientId);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setTargetClientId(clientId);
      console.log('Target client selected:', clientId);
      // No auto-advance - user must manually proceed to next step
    }
    
    performanceLogger.logPerformance('target-client-selection', performanceLogger.endTiming('target-client-selection'));
  }, [sourceClientId, validateTargetClient, performanceLogger, setTargetClientId, setValidationErrors]);

  return {
    handleSelectSourceClient,
    handleSelectTargetClient
  };
};
