
import { useState, useCallback, useEffect } from 'react';
import { ForecastMode } from '@/types/forecasting';
import { debugLog } from '@/services/forecasting/logger';
import { 
  generateClientSpecificMatrix,
  getCachedClientTasksForPeriod,
  monitorClientQueryPerformance,
  clientMatrixCache
} from '@/services/forecasting/clientMatrixService';

/**
 * Client Filtering Hook
 * 
 * Manages client-specific filtering state and data operations
 * for the matrix view without impacting existing functionality.
 */

interface UseClientFilteringProps {
  forecastType: ForecastMode;
  dateRange?: { startDate: Date; endDate: Date };
}

interface UseClientFilteringResult {
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string | null) => void;
  clientMatrixData: any[] | null;
  isLoading: boolean;
  error: string | null;
  refreshClientData: () => Promise<void>;
  clearClientFilter: () => void;
  hasClientFilter: boolean;
}

export const useClientFiltering = ({ 
  forecastType,
  dateRange 
}: UseClientFilteringProps): UseClientFilteringResult => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientMatrixData, setClientMatrixData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load client-specific matrix data
   */
  const loadClientMatrixData = useCallback(async (clientId: string) => {
    if (!clientId) return;

    setIsLoading(true);
    setError(null);

    try {
      await monitorClientQueryPerformance(
        `load-client-matrix-${clientId}`,
        async () => {
          debugLog(`Loading matrix data for client: ${clientId}`);
          
          const matrixData = await generateClientSpecificMatrix(
            clientId,
            forecastType,
            dateRange
          );
          
          setClientMatrixData(matrixData);
          debugLog(`Client matrix data loaded: ${matrixData.length} periods`);
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load client data';
      setError(errorMessage);
      console.error('Error loading client matrix data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [forecastType, dateRange]);

  /**
   * Handle client selection changes
   */
  const handleClientSelection = useCallback((clientId: string | null) => {
    debugLog(`Client selection changed: ${clientId}`);
    setSelectedClientId(clientId);
    
    if (clientId) {
      loadClientMatrixData(clientId);
    } else {
      setClientMatrixData(null);
      setError(null);
    }
  }, [loadClientMatrixData]);

  /**
   * Refresh current client data
   */
  const refreshClientData = useCallback(async () => {
    if (!selectedClientId) return;
    
    // Clear cache for this client
    clientMatrixCache.clearClient(selectedClientId);
    
    // Reload data
    await loadClientMatrixData(selectedClientId);
  }, [selectedClientId, loadClientMatrixData]);

  /**
   * Clear client filter and reset state
   */
  const clearClientFilter = useCallback(() => {
    debugLog('Clearing client filter');
    setSelectedClientId(null);
    setClientMatrixData(null);
    setError(null);
  }, []);

  /**
   * Auto-load data when client or forecast type changes
   */
  useEffect(() => {
    if (selectedClientId && forecastType) {
      loadClientMatrixData(selectedClientId);
    }
  }, [selectedClientId, forecastType, loadClientMatrixData]);

  return {
    selectedClientId,
    setSelectedClientId: handleClientSelection,
    clientMatrixData,
    isLoading,
    error,
    refreshClientData,
    clearClientFilter,
    hasClientFilter: selectedClientId !== null
  };
};

/**
 * Client context synchronization hook
 * Manages client context across different tabs
 */
interface UseClientContextSyncProps {
  onClientChange?: (clientId: string | null) => void;
}

export const useClientContextSync = ({ 
  onClientChange 
}: UseClientContextSyncProps = {}) => {
  const [globalClientId, setGlobalClientId] = useState<string | null>(null);

  const updateGlobalClient = useCallback((clientId: string | null) => {
    debugLog(`Global client context updated: ${clientId}`);
    setGlobalClientId(clientId);
    onClientChange?.(clientId);
  }, [onClientChange]);

  const clearGlobalClient = useCallback(() => {
    updateGlobalClient(null);
  }, [updateGlobalClient]);

  return {
    globalClientId,
    setGlobalClientId: updateGlobalClient,
    clearGlobalClient
  };
};

/**
 * Client filtering performance metrics
 */
export const useClientFilteringMetrics = () => {
  const [metrics, setMetrics] = useState({
    lastQueryTime: 0,
    averageQueryTime: 0,
    queryCount: 0,
    cacheHitRate: 0
  });

  const recordQuery = useCallback((duration: number, cacheHit: boolean) => {
    setMetrics(prev => ({
      lastQueryTime: duration,
      averageQueryTime: (prev.averageQueryTime * prev.queryCount + duration) / (prev.queryCount + 1),
      queryCount: prev.queryCount + 1,
      cacheHitRate: cacheHit 
        ? (prev.cacheHitRate * (prev.queryCount - 1) + 1) / prev.queryCount
        : (prev.cacheHitRate * (prev.queryCount - 1)) / prev.queryCount
    }));
  }, []);

  return {
    metrics,
    recordQuery
  };
};
