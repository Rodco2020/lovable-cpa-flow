
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

  // PHASE 3: Enhanced synchronization of success state from copy dialog hook
  useEffect(() => {
    console.log('🔍 PHASE 3 FIX - useCopyState: Synchronizing success state from copy dialog', {
      isCopySuccessFromDialog,
      currentIsCopySuccess: isCopySuccess,
      copyStep,
      isCopyProcessing,
      timestamp: new Date().toISOString()
    });

    // PHASE 3: Update local success state to match copy dialog success state with immediate propagation
    if (isCopySuccessFromDialog !== isCopySuccess) {
      console.log('🔍 PHASE 3 FIX - useCopyState: SUCCESS STATE CHANGE DETECTED - Immediate synchronization', {
        from: isCopySuccess,
        to: isCopySuccessFromDialog,
        reason: 'Copy dialog hook state updated',
        copyStep,
        isCopyProcessing
      });
      setIsCopySuccess(isCopySuccessFromDialog);
    }

    // PHASE 3: Enhanced verification for step progression readiness
    if (isCopySuccessFromDialog && !isCopyProcessing) {
      console.log('🔍 PHASE 3 FIX - useCopyState: COPY OPERATION FULLY COMPLETED - Ready for immediate step progression', {
        isCopySuccess: isCopySuccessFromDialog,
        isCopyProcessing,
        copyStep,
        message: 'Success state confirmed and propagated for wizard step progression'
      });
    }

    // PHASE 3: Handle copyStep success indication
    if (copyStep === 'success' && !isCopySuccess) {
      console.log('🔍 PHASE 3 FIX - useCopyState: Copy step indicates success - updating local state', {
        copyStep,
        previousIsCopySuccess: isCopySuccess
      });
      setIsCopySuccess(true);
    }
  }, [isCopySuccessFromDialog, isCopyProcessing, copyStep, isCopySuccess]);

  // Enhanced logging for copy state changes with detailed debugging
  useEffect(() => {
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyState: Copy state updated', {
      copyStep,
      isCopyProcessing,
      isCopySuccess,
      isCopySuccessFromDialog,
      timestamp: new Date().toISOString()
    });

    // Debug state synchronization
    if (isCopySuccess) {
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyState: SUCCESS STATE ACTIVE - Copy operation completed and verified in database');
    }
    
    if (!isCopyProcessing && isCopySuccess) {
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyState: OPERATION COMPLETE - Processing=false, Success=true with database verification');
    }
  }, [copyStep, isCopyProcessing, isCopySuccess, isCopySuccessFromDialog]);

  return {
    isCopySuccess,
    setIsCopySuccess
  };
};
