
import { useCallback } from 'react';

interface TabNavigationOptions {
  clientId?: string;
  taskId?: string;
  fromTab?: string;
}

/**
 * Hook for cross-tab navigation functionality
 * Provides navigation capabilities between Matrix and Client Details tabs
 */
export const useTabNavigation = () => {
  const navigateToClientDetails = useCallback((options: TabNavigationOptions = {}) => {
    // In a real implementation, this would update the active tab state
    // For now, we'll just log the navigation intent
    console.log('Navigate to Client Details tab', options);
    
    // Future implementation could use React Router or context to switch tabs
    // and pass the client/task information
  }, []);

  const navigateToMatrix = useCallback((options: TabNavigationOptions = {}) => {
    // Navigate back to Matrix tab with optional context
    console.log('Navigate to Matrix tab', options);
  }, []);

  const navigateWithClientContext = useCallback((
    targetTab: 'matrix' | 'client-details' | 'charts' | 'gaps',
    clientId: string
  ) => {
    console.log(`Navigate to ${targetTab} with client context:`, clientId);
    // This would be implemented to maintain client context across tab switches
  }, []);

  return {
    navigateToClientDetails,
    navigateToMatrix,
    navigateWithClientContext
  };
};
