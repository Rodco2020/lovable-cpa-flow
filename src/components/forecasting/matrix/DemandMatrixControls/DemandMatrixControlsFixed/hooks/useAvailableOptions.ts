
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { FilteringValidationService } from '@/services/forecasting/demand/dataFetcher/filteringValidationService';
import { AvailableOptions } from '../types';

/**
 * Hook for extracting available options from demand data
 * Preserves exact logic from DemandMatrixControlsFixed
 */
export const useAvailableOptions = (demandData: DemandMatrixData | null): AvailableOptions => {
  const availableSkills = demandData?.skills || [];
  
  const availableClients = React.useMemo(() => {
    if (!demandData) return [];
    const clientsSet = new Set<{id: string, name: string}>();
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach((task: any) => {
        if (task.clientId && task.clientName) {
          clientsSet.add({ id: task.clientId, name: task.clientName });
        }
      });
    });
    return Array.from(clientsSet);
  }, [demandData]);

  const availablePreferredStaff = React.useMemo(() => {
    if (!demandData) return [];
    const staffSet = new Set<{id: string, name: string}>();
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach((task: any) => {
        if (task.preferredStaff) {
          const staffId = FilteringValidationService.extractStaffId(task.preferredStaff);
          if (staffId) {
            const staffName = typeof task.preferredStaff === 'object' 
              ? (task.preferredStaff.full_name || task.preferredStaff.name || staffId)
              : staffId;
            staffSet.add({ id: staffId, name: staffName });
          }
        }
      });
    });
    return Array.from(staffSet);
  }, [demandData]);

  return {
    availableSkills,
    availableClients,
    availablePreferredStaff
  };
};
