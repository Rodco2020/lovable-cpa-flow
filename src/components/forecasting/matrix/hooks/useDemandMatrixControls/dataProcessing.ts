
import { useEffect, useMemo } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { AvailableOptions, SelectionStates } from './types';
import { EnhancedDataService } from '@/services/forecasting/demand/dataFetcher/enhancedDataService';

/**
 * Hook for processing demand data and extracting available options
 * Handles data validation and availability debugging
 */
export const useDataProcessing = (
  demandData: DemandMatrixData | null,
  selectedSkills: SkillType[],
  selectedClients: string[],
  selectedPreferredStaff: string[],
  isLoading: boolean
) => {
  // Extract available options from the fetched data
  const availableOptions: AvailableOptions = useMemo(() => {
    if (!demandData) {
      return {
        availableSkills: [],
        availableClients: [],
        availablePreferredStaff: []
      };
    }

    return {
      availableSkills: demandData.skills || [],
      availableClients: demandData.availableClients || [],
      availablePreferredStaff: demandData.availablePreferredStaff || []
    };
  }, [demandData]);

  // Calculate selection states
  const selectionStates: SelectionStates = useMemo(() => {
    const { availableSkills, availableClients, availablePreferredStaff } = availableOptions;
    
    return {
      isAllSkillsSelected: selectedSkills.length === 0 || selectedSkills.length === availableSkills.length,
      isAllClientsSelected: selectedClients.length === 0 || selectedClients.length === availableClients.length,
      isAllPreferredStaffSelected: selectedPreferredStaff.length === 0 || selectedPreferredStaff.length === availablePreferredStaff.length
    };
  }, [availableOptions, selectedSkills, selectedClients, selectedPreferredStaff]);

  // Enhanced data availability debugging
  useEffect(() => {
    if (demandData) {
      const { availableSkills, availableClients, availablePreferredStaff } = availableOptions;
      
      console.log('📊 [DATA PROCESSING] Enhanced data received:', {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length,
        staffCount: availablePreferredStaff.length,
        dataPointsCount: demandData.dataPoints?.length || 0,
        totalDemand: demandData.totalDemand,
        skillTypes: availableSkills.slice(0, 5)
      });

      // Enhanced data validation with skill resolution
      const validation = EnhancedDataService.validateDataAvailability({
        clients: availableClients,
        staff: availablePreferredStaff,
        skills: availableSkills,
        recurringTasks: demandData.dataPoints || []
      });
      
      if (!validation.isValid) {
        console.warn('⚠️ [DATA PROCESSING] Enhanced data validation issues:', validation.issues);
      } else {
        console.log('✅ [DATA PROCESSING] Data validation passed successfully');
      }
    }
  }, [demandData, availableOptions]);

  // Enhanced debug info generation when no data is available
  useEffect(() => {
    if (!isLoading && (!demandData || demandData.dataPoints?.length === 0)) {
      console.log('🔧 [DATA PROCESSING] No demand data available, generating enhanced debug info...');
      
      EnhancedDataService.generateDebugInfo().then(debugInfo => {
        console.log('🔧 [DATA PROCESSING] Enhanced debug information:', debugInfo);
        
        if (!debugInfo.databaseConnection) {
          console.error('❌ [DATA PROCESSING] Database connection failed');
        } else if (Object.values(debugInfo.tableData).every(count => count === 0)) {
          console.warn('⚠️ [DATA PROCESSING] All tables appear to be empty');
        } else if (debugInfo.skillResolutionStatus && !debugInfo.skillResolutionStatus.initialized) {
          console.error('❌ [DATA PROCESSING] Skill resolution service failed to initialize:', debugInfo.skillResolutionStatus.error);
        }
      });
    }
  }, [isLoading, demandData]);

  return {
    availableOptions,
    selectionStates
  };
};
