
/**
 * Staff Dropdown Integration Hook
 * Manages staff data fetching and integration with demand matrix filtering
 */

import { useState, useEffect, useCallback } from 'react';
import { StaffFilterOption } from '@/types/demand';
import { CrossFilterIntegrationTester } from '@/services/forecasting/demand/performance/crossFilterIntegrationTester';
import { useToast } from '@/components/ui/use-toast';

export interface StaffDropdownState {
  staffOptions: StaffFilterOption[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

export interface StaffDropdownActions {
  refreshStaffData: () => Promise<void>;
  testIntegration: () => Promise<void>;
  clearError: () => void;
}

export const useStaffDropdownIntegration = () => {
  const [state, setState] = useState<StaffDropdownState>({
    staffOptions: [],
    isLoading: false,
    error: null,
    lastFetched: null
  });
  
  const { toast } = useToast();
  
  /**
   * Fetch staff data for dropdown
   */
  const fetchStaffData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔄 [Staff Dropdown Hook] Fetching staff data...');
      
      const { data: staffOptions, metrics } = await CrossFilterIntegrationTester.fetchStaffForDropdown();
      
      setState(prev => ({
        ...prev,
        staffOptions,
        isLoading: false,
        lastFetched: new Date()
      }));
      
      console.log(`✅ [Staff Dropdown Hook] Successfully loaded ${staffOptions.length} staff members`, {
        cacheHit: metrics.cacheHit,
        fetchTime: `${metrics.fetchTime.toFixed(2)}ms`
      });
      
      // Show success toast for manual refresh
      if (staffOptions.length > 0) {
        toast({
          title: "Staff Data Loaded",
          description: `Successfully loaded ${staffOptions.length} staff members`,
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ [Staff Dropdown Hook] Error fetching staff data:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      toast({
        title: "Error Loading Staff Data",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);
  
  /**
   * Test staff dropdown integration
   */
  const testIntegration = useCallback(async () => {
    try {
      console.log('🧪 [Staff Dropdown Hook] Testing integration...');
      
      const testResult = await CrossFilterIntegrationTester.testStaffDropdownIntegration({
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        skillFeeRates: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        },
        staffSummary: {},
        availableStaff: state.staffOptions
      });
      
      console.log('✅ [Staff Dropdown Hook] Integration test completed:', testResult);
      
      toast({
        title: "Integration Test Complete",
        description: `Staff Data: ${testResult.staffDataAvailable ? 'OK' : 'FAIL'}, Dropdown: ${testResult.dropdownFunctional ? 'OK' : 'FAIL'}, Filtering: ${testResult.filteringWorks ? 'OK' : 'FAIL'}`,
        variant: testResult.staffDataAvailable && testResult.dropdownFunctional && testResult.filteringWorks ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error('❌ [Staff Dropdown Hook] Integration test failed:', error);
      
      toast({
        title: "Integration Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  }, [state.staffOptions, toast]);
  
  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  /**
   * Auto-fetch staff data on component mount
   */
  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);
  
  const actions: StaffDropdownActions = {
    refreshStaffData: fetchStaffData,
    testIntegration,
    clearError
  };
  
  return {
    ...state,
    ...actions
  };
};
