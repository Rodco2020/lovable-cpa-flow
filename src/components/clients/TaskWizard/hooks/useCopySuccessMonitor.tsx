
import { useCopyProgressionMonitor } from './useCopySuccessMonitor/useCopyProgressionMonitor';
import { useCopyDialogMonitor } from './useCopySuccessMonitor/useCopyDialogMonitor';
import { CopySuccessMonitorParams } from './useCopySuccessMonitor/types';

/**
 * Custom hook for monitoring copy operation success and handling step transitions
 * 
 * This hook provides centralized step progression logic for copy operations.
 * It monitors the copy success state and automatically transitions from 
 * 'processing' to 'success' step when the operation completes.
 * 
 * The hook is composed of two specialized monitors:
 * - useCopyProgressionMonitor: Handles primary progression logic
 * - useCopyDialogMonitor: Monitors copy dialog state changes
 * 
 * @param currentStep - Current wizard step
 * @param isCopySuccess - Whether copy operation succeeded
 * @param isCopyProcessing - Whether copy operation is in progress
 * @param copyStep - Current copy operation step from dialog
 * @param setCurrentStep - Function to update current wizard step
 */
export const useCopySuccessMonitor = (
  currentStep: CopySuccessMonitorParams['currentStep'],
  isCopySuccess: CopySuccessMonitorParams['isCopySuccess'],
  isCopyProcessing: CopySuccessMonitorParams['isCopyProcessing'],
  copyStep: CopySuccessMonitorParams['copyStep'],
  setCurrentStep: CopySuccessMonitorParams['setCurrentStep']
) => {
  // Monitor primary copy success state and handle step transitions
  useCopyProgressionMonitor(
    currentStep,
    isCopySuccess,
    isCopyProcessing,
    copyStep,
    setCurrentStep
  );

  // Monitor copy dialog state changes for additional edge cases
  useCopyDialogMonitor(
    copyStep,
    isCopySuccess,
    isCopyProcessing,
    currentStep,
    setCurrentStep
  );
};
