
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { DemandMatrixData } from '@/types/demand';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Hook for managing demand matrix data filtering
 * 
 * Phase 3: Enhanced to handle preferred staff filtering along with existing filters
 * Handles all filtering logic including skill/client filtering, preferred staff filtering,
 * time horizon filtering, and grouping mode transformations.
 * 
 * Enhanced with better time horizon handling to prevent "No Demand Data Available" issues.
 */
export const useDemandMatrixFiltering = (
  demandData: DemandMatrixData | null,
  demandMatrixControls: any,
  groupingMode: 'skill' | 'client'
) => {
  // Filter data based on controls and grouping mode
  const getFilteredData = () => {
    if (!demandData) {
      console.log(`🔧 [DEMAND MATRIX] No demand data available for filtering`);
      return null;
    }

    console.log(`🔧 [DEMAND MATRIX] Starting filter operation:`, {
      groupingMode,
      selectedSkillsCount: demandMatrixControls.selectedSkills.length,
      availableSkillsCount: demandMatrixControls.availableSkills.length,
      selectedClientsCount: demandMatrixControls.selectedClients.length,
      availableClientsCount: demandMatrixControls.availableClients.length,
      selectedPreferredStaffCount: demandMatrixControls.selectedPreferredStaff.length,
      availablePreferredStaffCount: demandMatrixControls.availablePreferredStaff.length,
      isAllSkillsSelected: demandMatrixControls.isAllSkillsSelected,
      isAllClientsSelected: demandMatrixControls.isAllClientsSelected,
      isAllPreferredStaffSelected: demandMatrixControls.isAllPreferredStaffSelected,
      monthRange: demandMatrixControls.monthRange,
      originalDataPoints: demandData.dataPoints.length,
      availableMonths: demandData.months.length
    });

    // Enhanced month range handling with validation
    const safeMonthRange = {
      start: Math.max(0, demandMatrixControls.monthRange.start),
      end: Math.min(demandData.months.length - 1, demandMatrixControls.monthRange.end)
    };

    console.log(`🔍 [DEMAND MATRIX] Safe month range: ${safeMonthRange.start} to ${safeMonthRange.end}`);

    const filteredMonths = demandData.months.slice(safeMonthRange.start, safeMonthRange.end + 1);
    
    if (filteredMonths.length === 0) {
      console.warn(`⚠️ [DEMAND MATRIX] No months available after range filtering, using all months`);
      filteredMonths.push(...demandData.months);
    }

    console.log(`📅 [DEMAND MATRIX] Filtered months:`, filteredMonths.map(m => m.key));

    // Create time horizon with proper monthly boundaries
    let timeHorizonStart: Date, timeHorizonEnd: Date;
    
    try {
      if (filteredMonths.length > 0) {
        // Use month boundaries for better data matching
        timeHorizonStart = startOfMonth(new Date(filteredMonths[0].key + '-01'));
        timeHorizonEnd = endOfMonth(new Date(filteredMonths[filteredMonths.length - 1].key + '-01'));
      } else {
        // Fallback to current month
        const now = new Date();
        timeHorizonStart = startOfMonth(now);
        timeHorizonEnd = endOfMonth(now);
      }
    } catch (error) {
      console.error(`❌ [DEMAND MATRIX] Error creating time horizon:`, error);
      const now = new Date();
      timeHorizonStart = startOfMonth(now);
      timeHorizonEnd = endOfMonth(now);
    }

    console.log(`🕐 [DEMAND MATRIX] Time horizon:`, {
      start: timeHorizonStart.toISOString(),
      end: timeHorizonEnd.toISOString(),
      daysDifference: Math.ceil((timeHorizonEnd.getTime() - timeHorizonStart.getTime()) / (1000 * 60 * 60 * 24))
    });
    
    // Phase 3: Create filters with correct "no active filtering" logic including preferred staff
    const filters = {
      // Only include skills filter if we're NOT selecting all skills
      skills: demandMatrixControls.isAllSkillsSelected ? [] : demandMatrixControls.selectedSkills,
      // Only include clients filter if we're NOT selecting all clients  
      clients: demandMatrixControls.isAllClientsSelected ? [] : demandMatrixControls.selectedClients,
      // Phase 3: Only include preferred staff filter if we're NOT selecting all staff
      preferredStaff: demandMatrixControls.isAllPreferredStaffSelected ? [] : demandMatrixControls.selectedPreferredStaff,
      timeHorizon: {
        start: timeHorizonStart,
        end: timeHorizonEnd
      }
    };

    console.log(`🎯 [DEMAND MATRIX] Applied filters:`, {
      skillsFilter: filters.skills.length === 0 ? 'ALL SKILLS (no filter)' : filters.skills,
      clientsFilter: filters.clients.length === 0 ? 'ALL CLIENTS (no filter)' : filters.clients,
      preferredStaffFilter: filters.preferredStaff.length === 0 ? 'ALL STAFF (no filter)' : filters.preferredStaff,
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
      totalTasks: optimizedData.totalTasks,
      totalClients: optimizedData.totalClients,
      preferredStaffFilterApplied: filters.preferredStaff.length > 0
    });

    // Safeguard: If filtering resulted in no data, provide diagnostic information
    if (optimizedData.dataPoints.length === 0) {
      console.error(`❌ [DEMAND MATRIX] All data was filtered out!`);
      console.log(`🔍 [DEMAND MATRIX] Diagnostic information:`, {
        originalMonths: demandData.months.map(m => m.key),
        filteredMonthKeys: filteredMonths.map(m => m.key),
        originalSkills: demandData.skills,
        selectedSkills: filters.skills,
        timeRange: `${filters.timeHorizon.start.toISOString()} to ${filters.timeHorizon.end.toISOString()}`,
        sampleDataPoints: demandData.dataPoints.slice(0, 3).map(dp => ({
          month: dp.month,
          skillType: dp.skillType,
          demandHours: dp.demandHours
        }))
      });
    }

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
