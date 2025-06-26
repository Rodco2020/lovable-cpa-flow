
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { DemandMatrixData } from '@/types/demand';

/**
 * Hook for managing demand matrix data filtering
 * 
 * Phase 3: Enhanced to handle preferred staff filtering along with existing filters
 * Handles all filtering logic including skill/client filtering, preferred staff filtering,
 * time horizon filtering, and grouping mode transformations.
 */
export const useDemandMatrixFiltering = (
  demandData: DemandMatrixData | null,
  demandMatrixControls: any,
  groupingMode: 'skill' | 'client'
) => {
  // Filter data based on controls and grouping mode
  const getFilteredData = () => {
    if (!demandData) return null;

    console.log(`🔧 [DEMAND MATRIX] Starting filter operation:`, {
      groupingMode,
      selectedSkillsCount: demandMatrixControls.selectedSkills.length,
      availableSkillsCount: demandMatrixControls.availableSkills.length,
      selectedClientsCount: demandMatrixControls.selectedClients.length,
      availableClientsCount: demandMatrixControls.availableClients.length,
      selectedPreferredStaffCount: demandMatrixControls.selectedPreferredStaff.length, // Phase 3: Log preferred staff
      availablePreferredStaffCount: demandMatrixControls.availablePreferredStaff.length,
      isAllSkillsSelected: demandMatrixControls.isAllSkillsSelected,
      isAllClientsSelected: demandMatrixControls.isAllClientsSelected,
      isAllPreferredStaffSelected: demandMatrixControls.isAllPreferredStaffSelected, // Phase 3: Log preferred staff selection
      monthRange: demandMatrixControls.monthRange
    });

    const filteredMonths = demandData.months.slice(demandMatrixControls.monthRange.start, demandMatrixControls.monthRange.end + 1);
    
    // Phase 3: Create filters with correct "no active filtering" logic including preferred staff
    const filters = {
      // Only include skills filter if we're NOT selecting all skills
      skills: demandMatrixControls.isAllSkillsSelected ? [] : demandMatrixControls.selectedSkills,
      // Only include clients filter if we're NOT selecting all clients  
      clients: demandMatrixControls.isAllClientsSelected ? [] : demandMatrixControls.selectedClients,
      // Phase 3: Only include preferred staff filter if we're NOT selecting all staff
      preferredStaff: demandMatrixControls.isAllPreferredStaffSelected ? [] : demandMatrixControls.selectedPreferredStaff,
      timeHorizon: {
        start: filteredMonths[0] ? new Date(filteredMonths[0].key) : new Date(),
        end: filteredMonths[filteredMonths.length - 1] ? new Date(filteredMonths[filteredMonths.length - 1].key) : new Date()
      }
    };

    console.log(`🎯 [DEMAND MATRIX] Applied filters:`, {
      skillsFilter: filters.skills.length === 0 ? 'ALL SKILLS (no filter)' : filters.skills,
      clientsFilter: filters.clients.length === 0 ? 'ALL CLIENTS (no filter)' : filters.clients,
      preferredStaffFilter: filters.preferredStaff.length === 0 ? 'ALL STAFF (no filter)' : filters.preferredStaff, // Phase 3: Log preferred staff filter
      timeHorizonFilter: `${filters.timeHorizon.start.toISOString().split('T')[0]} to ${filters.timeHorizon.end.toISOString().split('T')[0]}`
    });

    // Use the performance optimizer with enhanced filtering
    const optimizedData = DemandPerformanceOptimizer.optimizeFiltering(demandData, filters);
    
    console.log(`📊 [DEMAND MATRIX] Filter results:`, {
      originalDataPoints: demandData.dataPoints.length,
      filteredDataPoints: optimizedData.dataPoints.length,
      originalSkills: demandData.skills.length,
      filteredSkills: optimizedData.skills.length,
      totalDemandHours: optimizedData.totalDemand || 0,
      preferredStaffFilterApplied: filters.preferredStaff.length > 0 // Phase 3: Log if preferred staff filter was applied
    });

    // Handle grouping mode transformation
    if (groupingMode === 'client') {
      // Transform data for client-based view - use the optimized data
      const clientGroupedData = {
        ...optimizedData,
        skills: Array.from(new Set(
          optimizedData.dataPoints
            .flatMap(point => point.taskBreakdown?.map(task => task.clientName) || [])
            .filter(name => name && !name.includes('...'))
        )),
        dataPoints: optimizedData.dataPoints // Use the already filtered data points
      };

      console.log(`👥 [DEMAND MATRIX] Client grouping applied:`, {
        uniqueClients: clientGroupedData.skills.length,
        dataPointsAfterGrouping: clientGroupedData.dataPoints.length
      });

      return clientGroupedData;
    }

    return optimizedData;
  };

  return {
    getFilteredData
  };
};
