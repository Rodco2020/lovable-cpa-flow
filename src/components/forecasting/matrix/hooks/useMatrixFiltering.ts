
import { useMemo } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';

interface UseMatrixFilteringProps {
  demandData?: DemandMatrixData | null;
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

/**
 * ENHANCED: Hook for managing matrix filtering logic with proper data extraction and staff name resolution
 */
export const useMatrixFiltering = ({
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  groupingMode
}: UseMatrixFilteringProps) => {
  // Extract available skills from resolved matrix data
  const availableSkills = useMemo(() => {
    if (!demandData) {
      console.log('🔍 [MATRIX FILTERING] No demand data available for skills extraction');
      return [];
    }

    console.log('🔍 [MATRIX FILTERING] Extracting available skills from resolved matrix data:', {
      skillsFromData: demandData.skills,
      dataPointsCount: demandData.dataPoints.length
    });

    // Use the skills array from matrix data (these are already resolved display names)
    const extractedSkills = demandData.skills || [];
    
    // Also extract from data points as fallback
    if (extractedSkills.length === 0) {
      const skillsFromDataPoints = new Set<string>();
      demandData.dataPoints.forEach(point => {
        if (point.skillType) {
          skillsFromDataPoints.add(point.skillType);
        }
      });
      const fallbackSkills = Array.from(skillsFromDataPoints).sort();
      
      console.log('🔍 [MATRIX FILTERING] Using fallback skills extraction:', {
        fallbackSkills
      });
      
      return fallbackSkills;
    }
    
    console.log('✅ [MATRIX FILTERING] Available skills extracted:', {
      count: extractedSkills.length,
      skills: extractedSkills
    });

    return extractedSkills;
  }, [demandData?.skills, demandData?.dataPoints]);

  // Extract available clients from task breakdowns with proper validation
  const availableClients = useMemo(() => {
    if (!demandData) {
      console.log('🔍 [MATRIX FILTERING] No demand data available for clients extraction');
      return [];
    }

    console.log('🔍 [MATRIX FILTERING] Extracting available clients from resolved matrix data...');
    
    // Extract unique clients from all task breakdowns
    const clientsMap = new Map<string, { id: string; name: string }>();
    
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        if (task.clientName && task.clientId) {
          // Only accept clients with meaningful names (not UUID fallbacks)
          const isValidClientName = (name: string): boolean => {
            // Skip obvious UUID patterns
            if (name.includes('-') && name.length > 30) return false;
            // Skip fallback patterns
            if (name.includes('...') || name.startsWith('Client ')) return false;
            // Accept names that look like real business names
            return name.length > 3;
          };
          
          if (isValidClientName(task.clientName)) {
            clientsMap.set(task.clientId, {
              id: task.clientId,
              name: task.clientName
            });
            
            console.log(`✅ [MATRIX FILTERING] Added resolved client: ${task.clientName} (${task.clientId})`);
          } else {
            console.log(`⚠️ [MATRIX FILTERING] Skipped invalid client name: ${task.clientName}`);
          }
        }
      });
    });
    
    const extractedClients = Array.from(clientsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('✅ [MATRIX FILTERING] Available clients extracted:', {
      count: extractedClients.length,
      clients: extractedClients.slice(0, 10).map(c => c.name) // Show first 10 for logging
    });

    return extractedClients;
  }, [demandData?.dataPoints]);

  // ENHANCED: Extract preferred staff from task breakdowns with resolved names
  const availablePreferredStaff = useMemo(() => {
    if (!demandData) {
      console.log('🔍 [MATRIX FILTERING] No demand data available for staff extraction');
      return [];
    }

    console.log('🔍 [MATRIX FILTERING] Extracting available preferred staff from resolved matrix data...');

    const staffMap = new Map<string, { id: string; name: string }>();
    
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        if (task.preferredStaffId && task.preferredStaffName) {
          // ENHANCED: Enhanced validation for resolved staff names
          const isValidStaffName = (name: string): boolean => {
            // Skip obvious fallback patterns
            if (name.includes('...') || name.startsWith('Staff ')) return false;
            // Accept names that look like real person names (contains spaces, reasonable length)
            if (name.includes(' ') && name.length > 5) return true;
            // Accept single names if they're reasonable length
            return name.length > 2 && name.length < 50;
          };

          if (isValidStaffName(task.preferredStaffName)) {
            staffMap.set(task.preferredStaffId, {
              id: task.preferredStaffId,
              name: task.preferredStaffName
            });
            
            console.log(`✅ [MATRIX FILTERING] Added resolved staff: ${task.preferredStaffName} (${task.preferredStaffId})`);
          } else {
            console.log(`⚠️ [MATRIX FILTERING] Skipped invalid staff name: ${task.preferredStaffName}`);
          }
        }
      });
    });

    const extractedStaff = Array.from(staffMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('✅ [MATRIX FILTERING] Available preferred staff extracted:', {
      count: extractedStaff.length,
      staff: extractedStaff.slice(0, 10).map(s => s.name),
      staffDetails: extractedStaff.slice(0, 5).map(s => ({ id: s.id, name: s.name }))
    });

    return extractedStaff;
  }, [demandData?.dataPoints]);

  // Calculate selection state flags for proper filtering logic
  const isAllSkillsSelected = useMemo(() => {
    return availableSkills.length > 0 && selectedSkills.length === availableSkills.length;
  }, [availableSkills.length, selectedSkills.length]);

  const isAllClientsSelected = useMemo(() => {
    return availableClients.length > 0 && selectedClients.length === availableClients.length;
  }, [availableClients.length, selectedClients.length]);

  const isAllPreferredStaffSelected = useMemo(() => {
    return availablePreferredStaff.length > 0 && selectedPreferredStaff.length === availablePreferredStaff.length;
  }, [availablePreferredStaff.length, selectedPreferredStaff.length]);

  // Enhanced validation and logging
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!demandData) {
      errors.push('No demand data available');
    } else {
      if (availableSkills.length === 0) {
        errors.push('No skills found in demand data');
      }
      
      if (!demandData.dataPoints || demandData.dataPoints.length === 0) {
        errors.push('No data points found in demand data');
      }
    }
    
    return errors;
  }, [demandData, availableSkills.length]);

  // Log filtering state for debugging
  console.log('🎛️ [MATRIX FILTERING] Current filtering state:', {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    availablePreferredStaff: availablePreferredStaff.length,
    selectedSkills: selectedSkills.length,
    selectedClients: selectedClients.length,
    selectedPreferredStaff: selectedPreferredStaff.length,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    validationErrors,
    groupingMode,
    staffNamesResolved: availablePreferredStaff.length > 0 ? 'YES' : 'NO'
  });

  return {
    availableSkills,
    availableClients,
    availablePreferredStaff,
    isAllSkillsSelected,
    isAllClientsSelected,
    isAllPreferredStaffSelected,
    validationErrors
  };
};
