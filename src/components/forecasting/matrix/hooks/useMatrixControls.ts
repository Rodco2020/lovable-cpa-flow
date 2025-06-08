
import { useState } from 'react';

/**
 * Hook for managing matrix controls state including client filters
 */
export const useMatrixControls = () => {
  const [isClientFilterCollapsed, setIsClientFilterCollapsed] = useState(false);
  
  // Enable debug mode for Phase 1 testing
  const isDebugMode = process.env.NODE_ENV === 'development';

  const toggleClientFilter = () => {
    setIsClientFilterCollapsed(prev => !prev);
  };

  return {
    isClientFilterCollapsed,
    toggleClientFilter,
    isDebugMode
  };
};
