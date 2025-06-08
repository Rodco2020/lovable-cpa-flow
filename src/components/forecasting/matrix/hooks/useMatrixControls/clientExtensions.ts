
import { useState, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { ForecastMode } from '@/types/forecasting';
import { debugLog } from '@/services/forecasting/logger';

/**
 * Client Extensions for Matrix Controls
 * 
 * Extends the existing matrix controls with client filtering capabilities
 * without impacting the existing functionality.
 */

export interface ClientFilterState {
  selectedClientId: string | null;
  isClientFiltered: boolean;
  clientName: string | null;
}

export interface UseClientExtensionsProps {
  forecastType: ForecastMode;
  onClientFilterChange?: (clientId: string | null) => void;
}

export interface UseClientExtensionsResult {
  clientFilter: ClientFilterState;
  setClientFilter: (clientId: string | null, clientName?: string) => void;
  clearClientFilter: () => void;
  getEffectiveSkills: (baseSkills: SkillType[], clientSkills?: SkillType[]) => SkillType[];
  isClientModeActive: boolean;
}

/**
 * Client extensions hook for matrix controls
 */
export const useClientExtensions = ({
  forecastType,
  onClientFilterChange
}: UseClientExtensionsProps): UseClientExtensionsResult => {
  const [clientFilter, setClientFilterState] = useState<ClientFilterState>({
    selectedClientId: null,
    isClientFiltered: false,
    clientName: null
  });

  /**
   * Set client filter
   */
  const setClientFilter = useCallback((clientId: string | null, clientName?: string) => {
    debugLog(`Setting client filter: ${clientId} (${clientName || 'N/A'})`);
    
    const newState: ClientFilterState = {
      selectedClientId: clientId,
      isClientFiltered: clientId !== null,
      clientName: clientName || null
    };
    
    setClientFilterState(newState);
    onClientFilterChange?.(clientId);
  }, [onClientFilterChange]);

  /**
   * Clear client filter
   */
  const clearClientFilter = useCallback(() => {
    debugLog('Clearing client filter from matrix controls');
    setClientFilter(null);
  }, [setClientFilter]);

  /**
   * Get effective skills list combining base skills with client-specific skills
   */
  const getEffectiveSkills = useCallback((
    baseSkills: SkillType[], 
    clientSkills?: SkillType[]
  ): SkillType[] => {
    if (!clientFilter.isClientFiltered || !clientSkills) {
      return baseSkills;
    }

    // When client filtered, prioritize client skills but include all base skills
    const effectiveSkills = [...new Set([...clientSkills, ...baseSkills])];
    debugLog(`Effective skills for client filter: ${effectiveSkills.length} skills`);
    
    return effectiveSkills;
  }, [clientFilter.isClientFiltered]);

  const isClientModeActive = clientFilter.isClientFiltered;

  return {
    clientFilter,
    setClientFilter,
    clearClientFilter,
    getEffectiveSkills,
    isClientModeActive
  };
};

/**
 * Matrix data adapter for client filtering
 */
export interface MatrixDataAdapter {
  adaptMatrixData: (originalData: any[], clientData?: any[]) => any[];
  shouldUseClientData: boolean;
}

export const useMatrixDataAdapter = (clientFilter: ClientFilterState): MatrixDataAdapter => {
  const adaptMatrixData = useCallback((originalData: any[], clientData?: any[]) => {
    if (!clientFilter.isClientFiltered || !clientData) {
      return originalData;
    }

    debugLog(`Adapting matrix data for client filter: ${clientData.length} periods`);
    return clientData;
  }, [clientFilter.isClientFiltered]);

  return {
    adaptMatrixData,
    shouldUseClientData: clientFilter.isClientFiltered
  };
};

/**
 * Client context state management
 */
interface ClientContextState {
  activeClientId: string | null;
  clientHistory: Array<{ id: string; name: string; timestamp: number }>;
  maxHistorySize: number;
}

export const useClientContext = (maxHistorySize = 5) => {
  const [contextState, setContextState] = useState<ClientContextState>({
    activeClientId: null,
    clientHistory: [],
    maxHistorySize
  });

  const updateClientContext = useCallback((clientId: string | null, clientName?: string) => {
    setContextState(prev => {
      const newHistory = clientId && clientName
        ? [
            { id: clientId, name: clientName, timestamp: Date.now() },
            ...prev.clientHistory.filter(item => item.id !== clientId)
          ].slice(0, prev.maxHistorySize)
        : prev.clientHistory;

      return {
        ...prev,
        activeClientId: clientId,
        clientHistory: newHistory
      };
    });
  }, []);

  const clearClientContext = useCallback(() => {
    setContextState(prev => ({
      ...prev,
      activeClientId: null
    }));
  }, []);

  return {
    contextState,
    updateClientContext,
    clearClientContext
  };
};
