
import { useState, useEffect } from 'react';

/**
 * Hook for managing copy operation state synchronization
 * 
 * Handles the synchronization between the copy dialog hook state
 * and the wizard's internal copy success state, ensuring proper
 * step progression when copy operations complete.
 */
export const useCopyState = (
  isCopySuccessFromDialog: boolean,
  isCopyProcessing: boolean,
  copyStep: string
) => {
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  // Synchronize success state from copy dialog hook
  useEffect(() => {
    // Update local success state to match copy dialog success state
    if (isCopySuccessFromDialog !== isCopySuccess) {
      console.log('Copy success state updated:', { from: isCopySuccess, to: isCopySuccessFromDialog });
      setIsCopySuccess(isCopySuccessFromDialog);
    }

    // Handle copyStep success indication
    if (copyStep === 'success' && !isCopySuccess) {
      console.log('Copy step indicates success - updating local state');
      setIsCopySuccess(true);
    }
  }, [isCopySuccessFromDialog, isCopyProcessing, copyStep, isCopySuccess]);

  // Log copy state changes for debugging
  useEffect(() => {
    if (isCopySuccess && !isCopyProcessing) {
      console.log('Copy operation completed successfully');
    }
  }, [isCopySuccess, isCopyProcessing]);

  return {
    isCopySuccess,
    setIsCopySuccess
  };
};
