
import { useCallback } from 'react';

/**
 * Validation utilities for the copy tasks dialog workflow
 */
export const useValidation = () => {
  const validateSourceClient = useCallback((clientId: string): string[] => {
    const errors: string[] = [];
    if (!clientId || clientId.trim() === '') {
      errors.push('Source client is required');
    }
    return errors;
  }, []);

  const validateTargetClient = useCallback((clientId: string, sourceId: string): string[] => {
    const errors: string[] = [];
    if (!clientId || clientId.trim() === '') {
      errors.push('Target client is required');
    }
    if (clientId === sourceId) {
      errors.push('Target client cannot be the same as source client');
    }
    return errors;
  }, []);

  const validateTaskSelection = useCallback((taskIds: string[]): string[] => {
    const errors: string[] = [];
    if (taskIds.length === 0) {
      errors.push('At least one task must be selected');
    }
    return errors;
  }, []);

  return {
    validateSourceClient,
    validateTargetClient,
    validateTaskSelection
  };
};
