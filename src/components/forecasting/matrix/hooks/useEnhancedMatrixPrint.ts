
import { useState, useCallback } from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';

interface UseEnhancedMatrixPrintResult {
  showPrintView: boolean;
  printOptions: any;
  handlePrint: (options: any) => void;
  handlePrintExecute: () => void;
}

export const useEnhancedMatrixPrint = (): UseEnhancedMatrixPrintResult => {
  const [showPrintView, setShowPrintView] = useState(false);
  const [printOptions, setPrintOptions] = useState<any>(null);

  const handlePrint = useCallback((options: any) => {
    setPrintOptions(options);
    setShowPrintView(true);
  }, []);

  const handlePrintExecute = useCallback(() => {
    window.print();
    setShowPrintView(false);
    setPrintOptions(null);
  }, []);

  return {
    showPrintView,
    printOptions,
    handlePrint,
    handlePrintExecute
  };
};
