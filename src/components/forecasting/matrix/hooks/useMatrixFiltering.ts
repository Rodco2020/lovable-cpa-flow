
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
 * FIXED: Hook for managing matrix filtering logic
 * 
 * Now properly extracts skills and clients from resolved matrix data
 * and handles the transformation between UUIDs and display names.
 */
export const useMatrixFiltering = ({
  demandData,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  groupingMode
}: UseMatrixFilteringProps) => {
  // PHASE 1: Fixed Available Skills Extraction
  // Extract skills from the resolved matrix data (these are already display names)
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
    
    console.log('✅ [MATRIX FILTERING] Available skills extracted:', {
      count: extractedSkills.length,
      skills: extractedSkills
    });

    return extractedSkills;
  }, [demandData?.skills, demandData?.dataPoints]);

  // PHASE 2: Fixed Available Clients Extraction  
  // Extract clients from task breakdowns (these are already resolved names)
  const availableClients = useMemo(() => {
    if (!demandData) {
      console.log('🔍 [MATRIX FILTERING] No demand data available for clients extraction');
      return [];
    }

    console.log('🔍 [MATRIX FILTERING] Extracting available clients from resolved matrix data...');
    
    // Extract unique clients from all task breakdowns
    const clientsSet = new Set<{ id: string; name: string }>();
    
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        if (task.clientName && task.clientId) {
          // Filter out fallback UUID patterns - we want proper resolved names
          const isResolvedName = !task.clientName.includes('...') && !task.clientName.startsWith('Client ');
          
          if (isResolvedName || task.clientName.length > 20) {
            // Accept if it's a resolved name OR if it's longer than typical UUID fallback
            const clientKey = `${task.clientId}-${task.clientName}`;
            
            // Use a composite key to avoid duplicates while preserving both id and name
            if (![...clientsSet].some(c => c.id === task.clientId)) {
              clientsSet.add({
                id: task.clientId,
                name: task.clientName
              });
              
              console.log(`✅ [MATRIX FILTERING] Added resolved client: ${task.clientName} (${task.clientId})`);
            }
          } else {
            console.log(`⚠️ [MATRIX FILTERING] Skipped fallback client name: ${task.clientName}`);
          }
        }
      });
    });
    
    const extractedClients = Array.from(clientsSet).sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('✅ [MATRIX FILTERING] Available clients extracted:', {
      count: extractedClients.length,
      clients: extractedClients.slice(0, 10).map(c => c.name) // Show first 10 for logging
    });

    return extractedClients;
  }, [demandData?.dataPoints]);

  // PHASE 3: Enhanced Preferred Staff Extraction (for future use)
  const availablePreferredStaff = useMemo(() => {
    if (!demandData) {
      return [];
    }

    const staffSet = new Set<{ id: string; name: string }>();
    
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        if (task.preferredStaffId && task.preferredStaffName) {
          const staffKey = `${task.preferredStaffId}-${task.preferredStaffName}`;
          
          if (![...staffSet].some(s => s.id === task.preferredStaffId)) {
            staffSet.add({
              id: task.preferredStaffId,
              name: task.preferredStaffName
            });
          }
        }
      });
    });

    return Array.from(staffSet).sort((a, b) => a.name.localeCompare(b.name));
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

  // PHASE 4: Enhanced validation and logging
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!demandData) {
      errors.push('No demand data available');
    } else {
      if (!demandData.skills || demandData.skills.length === 0) {
        errors.push('No skills found in demand data');
      }
      
      if (!demandData.dataPoints || demandData.dataPoints.length === 0) {
        errors.push('No data points found in demand data');
      }
    }
    
    return errors;
  }, [demandData]);

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
    groupingMode
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
