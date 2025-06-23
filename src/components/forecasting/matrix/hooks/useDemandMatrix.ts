
/**
 * Demand Matrix Hook
 * Manages demand matrix data and filtering state
 */

import { useState, useEffect, useCallback } from 'react';
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { useToast } from '@/components/ui/use-toast';

export interface DemandMatrixState {
  demandData: DemandMatrixData | null;
  isLoading: boolean;
  error: string | null;
  filters: DemandFilters;
  groupingMode: 'skill' | 'client';
  monthRange: { start: number; end: number };
}

export interface DemandMatrixActions {
  updateFilters: (newFilters: Partial<DemandFilters>) => void;
  setGroupingMode: (mode: 'skill' | 'client') => void;
  setMonthRange: (range: { start: number; end: number }) => void;
  exportData: () => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
}

export const useDemandMatrix = () => {
  const [state, setState] = useState<DemandMatrixState>({
    demandData: null,
    isLoading: false,
    error: null,
    filters: {
      skills: [],
      clients: [],
      preferredStaff: []
    },
    groupingMode: 'skill',
    monthRange: { start: 0, end: 11 }
  });
  
  const { toast } = useToast();
  
  /**
   * Load demand matrix data
   */
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('Loading demand matrix data...');
      
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      setState(prev => ({
        ...prev,
        demandData: matrixData,
        isLoading: false
      }));
      
      console.log('Demand matrix data loaded successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load demand matrix';
      console.error('Error loading demand matrix:', error);
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      
      toast({
        title: "Error loading demand matrix",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);
  
  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Partial<DemandFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);
  
  /**
   * Set grouping mode
   */
  const setGroupingMode = useCallback((mode: 'skill' | 'client') => {
    setState(prev => ({ ...prev, groupingMode: mode }));
  }, []);
  
  /**
   * Set month range
   */
  const setMonthRange = useCallback((range: { start: number; end: number }) => {
    setState(prev => ({ ...prev, monthRange: range }));
  }, []);
  
  /**
   * Export data
   */
  const exportData = useCallback(() => {
    console.log('Exporting demand matrix data...');
    toast({
      title: "Export started",
      description: "Demand matrix data export is being prepared",
    });
  }, [toast]);
  
  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        skills: [],
        clients: [],
        preferredStaff: []
      }
    }));
  }, []);
  
  /**
   * Refresh data
   */
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const actions: DemandMatrixActions = {
    updateFilters,
    setGroupingMode,
    setMonthRange,
    exportData,
    resetFilters,
    refreshData
  };
  
  return {
    ...state,
    ...actions
  };
};
