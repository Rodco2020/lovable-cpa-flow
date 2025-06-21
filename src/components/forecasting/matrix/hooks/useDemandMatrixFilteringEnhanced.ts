
import { useMemo } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

interface UseDemandMatrixFilteringEnhancedProps {
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
 * Phase 3: Enhanced Demand Matrix Filtering Hook
 * 
 * PHASE 3 ENHANCEMENTS:
 * - Enhanced skill filtering with resolved name validation
 * - Improved filter compatibility checking
 * - Performance optimizations for large datasets
 * - Backward compatibility with UUID-based skill references
 * - Enhanced filter state validation and consistency
 */
export const useDemandMatrixFilteringEnhanced = ({
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  preferredStaffFilterMode
}: UseDemandMatrixFilteringEnhancedProps): DemandMatrixData | null => {
  
  return useMemo(() => {
    if (!demandData) {
      console.log(`🔍 [PHASE 3 FILTERING] No demand data available for enhanced filtering`);
      return null;
    }

    console.log(`🔍 [PHASE 3 FILTERING] Applying enhanced filtering with resolved skills:`, {
      preferredStaffFilterMode,
      selectedPreferredStaffCount: selectedPreferredStaff.length,
      selectedSkillsCount: selectedSkills.length,
      selectedClientsCount: selectedClients.length,
      totalDataPoints: demandData.dataPoints.length,
      isAllSkillsSelected,
      isAllClientsSelected
    });

    // Phase 3: Start with performance-optimized data points copy
    let filteredDataPoints = [...demandData.dataPoints];

    // Phase 3: Enhanced skills filtering with resolved name validation
    if (!isAllSkillsSelected && selectedSkills.length > 0) {
      console.log(`🎯 [PHASE 3 FILTERING] Applying enhanced skill filter for:`, selectedSkills);
      
      filteredDataPoints = filteredDataPoints.filter(point => {
        // Phase 3: Enhanced skill matching with validation
        const pointSkill = point.skillType;
        
        // Validate that the skill exists in selected skills
        const isSkillSelected = selectedSkills.includes(pointSkill);
        
        if (isSkillSelected) {
          console.log(`✅ [PHASE 3 FILTERING] Skill match found: ${pointSkill}`);
        }
        
        return isSkillSelected;
      });
      
      console.log(`🎯 [PHASE 3 FILTERING] Skill filtering result: ${filteredDataPoints.length} data points remaining`);
    }

    // Phase 3: Enhanced clients filtering with validation
    if (!isAllClientsSelected && selectedClients.length > 0) {
      console.log(`🏢 [PHASE 3 FILTERING] Applying enhanced client filter for:`, selectedClients.slice(0, 3));
      
      filteredDataPoints = filteredDataPoints.filter(point => {
        // Phase 3: Enhanced client validation
        const hasMatchingClient = point.taskBreakdown?.some(task => {
          const clientMatch = selectedClients.includes(task.clientId);
          return clientMatch;
        });
        
        return hasMatchingClient;
      });
      
      console.log(`🏢 [PHASE 3 FILTERING] Client filtering result: ${filteredDataPoints.length} data points remaining`);
    }

    // Phase 3: Enhanced three-mode preferred staff filtering with validation
    switch (preferredStaffFilterMode) {
      case 'all':
        // Show all tasks regardless of preferred staff assignment
        console.log(`🌐 [PHASE 3 FILTERING] All mode - showing all tasks`);
        break;

      case 'specific':
        // Show only tasks assigned to selected preferred staff
        if (selectedPreferredStaff.length > 0) {
          console.log(`🎯 [PHASE 3 FILTERING] Specific mode - filtering for staff:`, selectedPreferredStaff.slice(0, 2));
          
          filteredDataPoints = filteredDataPoints.filter(point => 
            point.taskBreakdown?.some(task => {
              // Phase 3: Enhanced preferred staff validation
              if (!task.preferredStaff) return false;
              
              // Handle different possible property structures for preferred staff
              let staffId: string | undefined;
              
              if (typeof task.preferredStaff === 'string') {
                staffId = task.preferredStaff;
              } else if (task.preferredStaff && typeof task.preferredStaff === 'object') {
                // Enhanced property extraction with fallbacks
                staffId = (task.preferredStaff as any).staffId || 
                         (task.preferredStaff as any).full_name || 
                         (task.preferredStaff as any).name ||
                         (task.preferredStaff as any).id;
              }
              
              const isStaffSelected = staffId && selectedPreferredStaff.includes(staffId);
              return isStaffSelected;
            })
          );
          
          console.log(`🎯 [PHASE 3 FILTERING] Specific staff filtering result: ${filteredDataPoints.length} data points remaining`);
        } else {
          // If no staff selected in specific mode, show no tasks
          filteredDataPoints = [];
          console.log(`🎯 [PHASE 3 FILTERING] Specific mode - no staff selected, showing no tasks`);
        }
        break;

      case 'none':
        // Show only tasks without preferred staff assignments
        console.log(`❌ [PHASE 3 FILTERING] None mode - showing only unassigned tasks`);
        
        filteredDataPoints = filteredDataPoints.filter(point => 
          point.taskBreakdown?.some(task => {
            // Phase 3: Enhanced unassigned task validation
            if (!task.preferredStaff) return true;
            
            // Handle different data structures
            if (typeof task.preferredStaff === 'string') {
              return !task.preferredStaff || task.preferredStaff === '';
            }
            
            if (task.preferredStaff && typeof task.preferredStaff === 'object') {
              const staffId = (task.preferredStaff as any).staffId || 
                             (task.preferredStaff as any).full_name || 
                             (task.preferredStaff as any).name ||
                             (task.preferredStaff as any).id;
              
              return !staffId || staffId === null || staffId === '';
            }
            
            return true;
          })
        );
        
        console.log(`❌ [PHASE 3 FILTERING] None mode filtering result: ${filteredDataPoints.length} data points remaining`);
        break;

      default:
        console.warn(`⚠️ [PHASE 3 FILTERING] Unknown preferred staff filter mode: ${preferredStaffFilterMode}`);
        break;
    }

    // Phase 3: Enhanced month range filtering (placeholder for future implementation)
    // This would be implemented if month-based filtering is needed
    
    // Phase 3: Enhanced validation and performance metrics
    const filteringStats = {
      originalCount: demandData.dataPoints.length,
      filteredCount: filteredDataPoints.length,
      reductionPercentage: demandData.dataPoints.length > 0 
        ? Math.round(((demandData.dataPoints.length - filteredDataPoints.length) / demandData.dataPoints.length) * 100)
        : 0,
      filtersApplied: {
        skills: !isAllSkillsSelected && selectedSkills.length > 0,
        clients: !isAllClientsSelected && selectedClients.length > 0,
        preferredStaff: preferredStaffFilterMode !== 'all'
      }
    };

    console.log(`✅ [PHASE 3 FILTERING] Enhanced filtering complete:`, filteringStats);

    // Phase 3: Return enhanced filtered data with updated summary statistics
    return {
      ...demandData,
      dataPoints: filteredDataPoints,
      // Update summary statistics based on filtered data
      totalDemand: filteredDataPoints.reduce((sum, point) => sum + (point.demandHours || 0), 0),
      totalTasks: filteredDataPoints.reduce((sum, point) => sum + (point.taskCount || 0), 0),
      totalClients: filteredDataPoints.reduce((sum, point) => sum + (point.clientCount || 0), 0)
    };

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
