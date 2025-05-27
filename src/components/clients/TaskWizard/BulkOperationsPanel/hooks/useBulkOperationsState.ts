
import { useMemo } from 'react';

export const useBulkOperationsState = (
  selectedClientCount: number,
  selectedTemplateCount: number,
  isRunning: boolean
) => {
  const totalOperations = useMemo(() => 
    selectedClientCount * selectedTemplateCount, 
    [selectedClientCount, selectedTemplateCount]
  );

  const canStart = useMemo(() => 
    totalOperations > 0 && !isRunning, 
    [totalOperations, isRunning]
  );

  return {
    totalOperations,
    canStart
  };
};
