
import { useMemo } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

interface UseDemandMatrixFilteringProps {
  demandData: DemandMatrixData | null;
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
}

/**
 * Enhanced Demand Matrix Filtering Hook with Comprehensive Debugging
 * 
 * ENHANCED FEATURES:
 * - Comprehensive filtering validation and debugging
 * - Proper handling of three-mode preferred staff filtering
 * - Enhanced performance with detailed memoization
 * - Fixed property access for different data structures
 * - Detailed logging for troubleshooting filter issues
 */
export const useDemandMatrixFiltering = ({
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode
}: UseDemandMatrixFilteringProps): DemandMatrixData | null => {
  
  return useMemo(() => {
    if (!demandData) {
      console.log(`🔍 [FILTERING] No demand data available for filtering`);
      return null;
    }

    console.group(`🔍 [FILTERING] Enhanced filtering with comprehensive debugging`);
    console.log(`📊 Input Data:`, {
      totalDataPoints: demandData.dataPoints.length,
      totalSkills: demandData.skills.length,
      totalMonths: demandData.months.length,
      totalDemand: demandData.totalDemand,
      totalTasks: demandData.totalTasks,
      totalClients: demandData.totalClients
    });

    console.log(`🎛️ Filter Settings:`, {
      preferredStaffFilterMode,
      isAllSkillsSelected,
      isAllClientsSelected,
      isAllPreferredStaffSelected,
      selectedSkillsCount: selectedSkills.length,
      selectedClientsCount: selectedClients.length,
      selectedPreferredStaffCount: selectedPreferredStaff.length,
      monthRange
    });

    // Start with original data points
    let filteredDataPoints = [...demandData.dataPoints];
    console.log(`🚀 Starting with ${filteredDataPoints.length} data points`);

    // Apply skills filtering
    if (!isAllSkillsSelected && selectedSkills.length > 0) {
      const beforeCount = filteredDataPoints.length;
      filteredDataPoints = filteredDataPoints.filter(point => 
        selectedSkills.includes(point.skillType)
      );
      console.log(`🎯 Skills filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
      console.log(`   Selected skills:`, selectedSkills);
    } else {
      console.log(`🎯 Skills filter: SKIPPED (all skills selected)`);
    }

    // Apply clients filtering
    if (!isAllClientsSelected && selectedClients.length > 0) {
      const beforeCount = filteredDataPoints.length;
      
      filteredDataPoints = filteredDataPoints.map(point => {
        // Filter task breakdown by selected clients
        const filteredTaskBreakdown = (point.taskBreakdown || []).filter((task: any) => 
          selectedClients.includes(task.clientId)
        );

        // Recalculate metrics based on filtered tasks
        const demandHours = filteredTaskBreakdown.reduce((sum: number, task: any) => sum + task.monthlyHours, 0);
        const taskCount = filteredTaskBreakdown.length;
        const uniqueClients = new Set(filteredTaskBreakdown.map((task: any) => task.clientId));

        return {
          ...point,
          taskBreakdown: filteredTaskBreakdown,
          demandHours,
          taskCount,
          clientCount: uniqueClients.size
        };
      }).filter(point => point.taskCount > 0); // Remove empty data points

      console.log(`👥 Clients filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
      console.log(`   Selected clients:`, selectedClients);
    } else {
      console.log(`👥 Clients filter: SKIPPED (all clients selected)`);
    }

    // Apply month range filtering
    const selectedMonthKeys = demandData.months
      .slice(monthRange.start, monthRange.end + 1)
      .map(month => month.key);
    
    if (selectedMonthKeys.length < demandData.months.length) {
      const beforeCount = filteredDataPoints.length;
      filteredDataPoints = filteredDataPoints.filter(point =>
        selectedMonthKeys.includes(point.month)
      );
      console.log(`📅 Month range filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
      console.log(`   Selected months:`, selectedMonthKeys);
    } else {
      console.log(`📅 Month range filter: SKIPPED (all months selected)`);
    }

    // Apply preferred staff filtering with enhanced debugging
    console.log(`👤 Applying preferred staff filter (mode: ${preferredStaffFilterMode})`);
    
    switch (preferredStaffFilterMode) {
      case 'all':
        console.log(`🌐 All mode - showing all tasks regardless of preferred staff`);
        // No additional filtering needed
        break;

      case 'specific':
        if (selectedPreferredStaff.length > 0) {
          const beforeCount = filteredDataPoints.length;
          
          filteredDataPoints = filteredDataPoints.map(point => {
            const filteredTaskBreakdown = (point.taskBreakdown || []).filter((task: any) => {
              // Handle different possible property structures for preferred staff
              if (!task.preferredStaff) return false;
              
              // Handle case where preferredStaff is a string (staff ID)
              if (typeof task.preferredStaff === 'string') {
                return selectedPreferredStaff.includes(task.preferredStaff);
              }
              
              // Handle case where preferredStaff is an object
              const staffId = (task.preferredStaff as any).staffId || 
                             (task.preferredStaff as any).full_name || 
                             (task.preferredStaff as any).name ||
                             (task.preferredStaff as any).id;
              
              const isMatch = staffId && selectedPreferredStaff.includes(staffId);
              
              if (!isMatch && task.preferredStaff) {
                console.log(`   Task "${task.taskName}" preferred staff check:`, {
                  preferredStaff: task.preferredStaff,
                  extractedStaffId: staffId,
                  selectedStaff: selectedPreferredStaff,
                  match: isMatch
                });
              }
              
              return isMatch;
            });

            // Recalculate metrics
            const demandHours = filteredTaskBreakdown.reduce((sum: number, task: any) => sum + task.monthlyHours, 0);
            const taskCount = filteredTaskBreakdown.length;
            const uniqueClients = new Set(filteredTaskBreakdown.map((task: any) => task.clientId));

            return {
              ...point,
              taskBreakdown: filteredTaskBreakdown,
              demandHours,
              taskCount,
              clientCount: uniqueClients.size
            };
          }).filter(point => point.taskCount > 0);
          
          console.log(`🎯 Specific staff filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
          console.log(`   Selected staff:`, selectedPreferredStaff);
        } else {
          console.log(`🎯 Specific mode - no staff selected, showing no tasks`);
          filteredDataPoints = [];
        }
        break;

      case 'none':
        const beforeCount = filteredDataPoints.length;
        
        filteredDataPoints = filteredDataPoints.map(point => {
          const filteredTaskBreakdown = (point.taskBreakdown || []).filter((task: any) => {
            // Check if task has no preferred staff assignment
            if (!task.preferredStaff) return true;
            
            // Handle case where preferredStaff is a string
            if (typeof task.preferredStaff === 'string') {
              return !task.preferredStaff || task.preferredStaff === '';
            }
            
            // Handle case where preferredStaff is an object but empty/null
            if (typeof task.preferredStaff === 'object') {
              const staffId = (task.preferredStaff as any).staffId || 
                             (task.preferredStaff as any).full_name || 
                             (task.preferredStaff as any).name ||
                             (task.preferredStaff as any).id;
              return !staffId || staffId === '';
            }
            
            return false;
          });

          // Recalculate metrics
          const demandHours = filteredTaskBreakdown.reduce((sum: number, task: any) => sum + task.monthlyHours, 0);
          const taskCount = filteredTaskBreakdown.length;
          const uniqueClients = new Set(filteredTaskBreakdown.map((task: any) => task.clientId));

          return {
            ...point,
            taskBreakdown: filteredTaskBreakdown,
            demandHours,
            taskCount,
            clientCount: uniqueClients.size
          };
        }).filter(point => point.taskCount > 0);
        
        console.log(`🚫 None mode filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
        break;
    }

    // Filter months based on range
    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    
    // Filter skills that still have data
    const availableSkills = Array.from(new Set(filteredDataPoints.map(point => point.skillType)));

    // Recalculate totals
    const totalDemand = filteredDataPoints.reduce((sum, point) => sum + point.demandHours, 0);
    const totalTasks = filteredDataPoints.reduce((sum, point) => sum + point.taskCount, 0);
    const uniqueClients = new Set<string>();
    filteredDataPoints.forEach(point => {
      point.taskBreakdown?.forEach((task: any) => {
        uniqueClients.add(task.clientId);
      });
    });

    const filteredData: DemandMatrixData = {
      ...demandData,
      months: filteredMonths,
      skills: availableSkills,
      dataPoints: filteredDataPoints,
      totalDemand,
      totalTasks,
      totalClients: uniqueClients.size
    };

    console.log(`✅ Filtering complete:`, {
      originalDataPoints: demandData.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      originalTotalDemand: demandData.totalDemand,
      filteredTotalDemand: totalDemand,
      originalTotalTasks: demandData.totalTasks,
      filteredTotalTasks: totalTasks,
      originalTotalClients: demandData.totalClients,
      filteredTotalClients: uniqueClients.size
    });

    console.groupEnd();
    return filteredData;

  }, [
    demandData,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    preferredStaffFilterMode
  ]);
};
