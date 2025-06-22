import { useMemo } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

interface UseDemandMatrixFilteringFixedProps {
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
 * FIXED: Demand Matrix Filtering Hook
 * 
 * FIXES IMPLEMENTED:
 * - Corrected preferred staff filtering logic for all three modes
 * - Proper metric recalculation after filtering
 * - Enhanced data structure validation
 * - Improved debugging and error handling
 */
export const useDemandMatrixFilteringFixed = ({
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode
}: UseDemandMatrixFilteringFixedProps): DemandMatrixData | null => {
  
  return useMemo(() => {
    if (!demandData) {
      console.log(`🔍 [FIXED FILTERING] No demand data available`);
      return null;
    }

    console.group(`🔍 [FIXED FILTERING] Starting comprehensive filtering fix`);
    console.log(`📊 Input data:`, {
      totalDataPoints: demandData.dataPoints.length,
      preferredStaffFilterMode,
      selectedPreferredStaffCount: selectedPreferredStaff.length
    });

    // Start with original data points
    let filteredDataPoints = [...demandData.dataPoints];

    // 1. Apply skills filtering
    if (!isAllSkillsSelected && selectedSkills.length > 0) {
      const beforeCount = filteredDataPoints.length;
      filteredDataPoints = filteredDataPoints.filter(point => 
        selectedSkills.includes(point.skillType)
      );
      console.log(`🎯 Skills filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
    }

    // 2. Apply clients filtering with proper task breakdown filtering
    if (!isAllClientsSelected && selectedClients.length > 0) {
      const beforeCount = filteredDataPoints.length;
      
      filteredDataPoints = filteredDataPoints.map(point => {
        const filteredTaskBreakdown = (point.taskBreakdown || []).filter((task: any) => 
          selectedClients.includes(task.clientId)
        );

        const demandHours = filteredTaskBreakdown.reduce((sum: number, task: any) => sum + (task.monthlyHours || 0), 0);
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

      console.log(`👥 Clients filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
    }

    // 3. Apply month range filtering
    const selectedMonthKeys = demandData.months
      .slice(monthRange.start, monthRange.end + 1)
      .map(month => month.key);
    
    if (selectedMonthKeys.length < demandData.months.length) {
      const beforeCount = filteredDataPoints.length;
      filteredDataPoints = filteredDataPoints.filter(point =>
        selectedMonthKeys.includes(point.month)
      );
      console.log(`📅 Month filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
    }

    // 4. FIXED: Apply preferred staff filtering with correct logic
    console.log(`👤 [FIXED] Applying preferred staff filter (mode: ${preferredStaffFilterMode})`);
    
    switch (preferredStaffFilterMode) {
      case 'all':
        // FIXED: In 'all' mode, NO FILTERING should be applied
        console.log(`🌐 [FIXED] All mode - showing all tasks without staff filtering`);
        // No filtering needed - keep all tasks
        break;

      case 'specific':
        if (selectedPreferredStaff.length > 0) {
          const beforeCount = filteredDataPoints.length;
          
          filteredDataPoints = filteredDataPoints.map(point => {
            const filteredTaskBreakdown = (point.taskBreakdown || []).filter((task: any) => {
              if (!task.preferredStaff) return false;
              
              // FIXED: Improved staff ID extraction with better validation
              let staffId: string | undefined;
              
              if (typeof task.preferredStaff === 'string') {
                staffId = task.preferredStaff;
              } else if (task.preferredStaff && typeof task.preferredStaff === 'object') {
                staffId = task.preferredStaff.staffId || 
                         task.preferredStaff.id || 
                         task.preferredStaff.full_name || 
                         task.preferredStaff.name;
              }
              
              const isMatch = staffId && selectedPreferredStaff.includes(staffId);
              
              console.log(`   [FIXED] Task "${task.taskName}" staff check:`, {
                staffId,
                selectedStaff: selectedPreferredStaff.slice(0, 2),
                isMatch
              });
              
              return isMatch;
            });

            // FIXED: Proper metric recalculation
            const demandHours = filteredTaskBreakdown.reduce((sum: number, task: any) => sum + (task.monthlyHours || 0), 0);
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
          
          console.log(`🎯 [FIXED] Specific staff filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
        } else {
          console.log(`🎯 [FIXED] Specific mode with no staff selected - showing no tasks`);
          filteredDataPoints = [];
        }
        break;

      case 'none':
        const beforeCount = filteredDataPoints.length;
        
        filteredDataPoints = filteredDataPoints.map(point => {
          const filteredTaskBreakdown = (point.taskBreakdown || []).filter((task: any) => {
            // FIXED: Show tasks WITHOUT preferred staff assignment
            if (!task.preferredStaff) return true;
            
            if (typeof task.preferredStaff === 'string') {
              return !task.preferredStaff || task.preferredStaff.trim() === '';
            }
            
            if (task.preferredStaff && typeof task.preferredStaff === 'object') {
              const staffId = task.preferredStaff.staffId || 
                             task.preferredStaff.id || 
                             task.preferredStaff.full_name || 
                             task.preferredStaff.name;
              
              return !staffId || staffId.trim() === '';
            }
            
            return false;
          });

          // FIXED: Proper metric recalculation
          const demandHours = filteredTaskBreakdown.reduce((sum: number, task: any) => sum + (task.monthlyHours || 0), 0);
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
        
        console.log(`🚫 [FIXED] None mode filter: ${beforeCount} → ${filteredDataPoints.length} data points`);
        break;

      default:
        console.warn(`⚠️ [FIXED] Unknown preferred staff filter mode: ${preferredStaffFilterMode}`);
        break;
    }

    // FIXED: Filter months and skills based on remaining data
    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    const availableSkills = Array.from(new Set(filteredDataPoints.map(point => point.skillType)));

    // FIXED: Proper total recalculation
    const totalDemand = filteredDataPoints.reduce((sum, point) => sum + (point.demandHours || 0), 0);
    const totalTasks = filteredDataPoints.reduce((sum, point) => sum + (point.taskCount || 0), 0);
    const uniqueClients = new Set<string>();
    
    filteredDataPoints.forEach(point => {
      if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
        point.taskBreakdown.forEach((task: any) => {
          if (task.clientId) {
            uniqueClients.add(task.clientId);
          }
        });
      }
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

    console.log(`✅ [FIXED] Filtering complete:`, {
      originalDataPoints: demandData.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      originalTotalDemand: demandData.totalDemand,
      filteredTotalDemand: totalDemand,
      filterMode: preferredStaffFilterMode,
      reductionPercentage: demandData.dataPoints.length > 0 
        ? Math.round(((demandData.dataPoints.length - filteredDataPoints.length) / demandData.dataPoints.length) * 100)
        : 0
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
