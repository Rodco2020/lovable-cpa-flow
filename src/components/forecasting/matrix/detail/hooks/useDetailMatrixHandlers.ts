import { useState } from 'react';

interface UseDetailMatrixHandlersResult {
  // Dialog states
  showExportDialog: boolean;
  showPrintDialog: boolean;
  
  // Dialog handlers
  handleOpenExportDialog: () => void;
  handleCloseExportDialog: () => void;
  handleOpenPrintDialog: () => void;
  handleClosePrintDialog: () => void;
}

/**
 * Detail Matrix Handlers Hook - Step 3
 * 
 * Manages all event handlers and dialog states for Detail Matrix.
 * Maintains exact same function signatures and behavior as original container.
 */
export const useDetailMatrixHandlers = (): UseDetailMatrixHandlersResult => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const handleOpenExportDialog = () => {
    setShowExportDialog(true);
  };

  const handleCloseExportDialog = () => {
    setShowExportDialog(false);
  };

  const handleOpenPrintDialog = () => {
    setShowPrintDialog(true);
  };

  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
  };

  return {
    showExportDialog,
    showPrintDialog,
    handleOpenExportDialog,
    handleCloseExportDialog,
    handleOpenPrintDialog,
    handleClosePrintDialog
  };
};