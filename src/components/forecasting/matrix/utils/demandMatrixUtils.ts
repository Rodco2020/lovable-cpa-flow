
/**
 * Utility functions for Demand Matrix operations
 * 
 * Contains helper functions for common operations and data transformations
 * used across the demand matrix components.
 */

/**
 * Create close handlers for various dialogs and modals
 */
export const createCloseHandlers = (stateSetters: {
  setDrillDownData: (data: any) => void;
  setSelectedDrillDown: (selection: any) => void;
  setShowExportDialog: (show: boolean) => void;
  setShowPrintExportDialog: (show: boolean) => void;
}) => {
  return {
    onCloseDrillDown: () => {
      stateSetters.setDrillDownData(null);
      stateSetters.setSelectedDrillDown(null);
    },
    onCloseExportDialog: () => stateSetters.setShowExportDialog(false),
    onClosePrintExportDialog: () => stateSetters.setShowPrintExportDialog(false),
  };
};

/**
 * Check if component is in loading state
 */
export const isComponentLoading = (
  isLoading: boolean,
  skillsLoading: boolean,
  clientsLoading: boolean
): boolean => {
  return isLoading || skillsLoading || clientsLoading;
};

/**
 * Log performance metrics for debugging
 */
export const logPerformanceMetrics = (
  operation: string,
  startTime: number,
  additionalData?: Record<string, any>
) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`⚡ [PERFORMANCE] ${operation} completed in ${duration.toFixed(2)}ms`, {
    duration,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
};
