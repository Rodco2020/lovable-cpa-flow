
import { useCallback } from 'react';

interface UseEnhancedMatrixActionsProps {
  matrixData: any;
  selectedSkills: string[];
  onEnhancedExport: (format: 'csv' | 'json', options: any) => void;
  onPrint: (options: any) => void;
}

interface UseEnhancedMatrixActionsResult {
  handleExport: (options?: any) => void;
  handlePrintAction: () => void;
}

export const useEnhancedMatrixActions = ({
  matrixData,
  selectedSkills,
  onEnhancedExport,
  onPrint
}: UseEnhancedMatrixActionsProps): UseEnhancedMatrixActionsResult => {
  const handleExport = useCallback((options: any = {}) => {
    console.log('Export options:', options);
    onEnhancedExport('csv', options);
  }, [onEnhancedExport]);

  const handlePrintAction = useCallback(() => {
    onPrint({});
  }, [onPrint]);

  return {
    handleExport,
    handlePrintAction
  };
};
