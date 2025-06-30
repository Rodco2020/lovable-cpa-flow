
import { useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixControlsState } from './types';

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * State management utilities for demand matrix controls with debounced updates
 * ENHANCED: Added debouncing to prevent rapid state changes that trigger infinite loops
 */
export const createStateHandlers = (
  setState: React.Dispatch<React.SetStateAction<DemandMatrixControlsState>>
) => {
  // DEBOUNCED: Staff selection with 200ms delay to prevent rapid toggles
  const debouncedStaffToggle = useCallback(
    debounce((staffId: string) => {
      console.log(`🎯 [DEBOUNCED CONTROLS] Staff toggle for: ${staffId}`);
      setState(prev => {
        const newSelection = prev.selectedPreferredStaff.includes(staffId)
          ? prev.selectedPreferredStaff.filter(id => id !== staffId)
          : [...prev.selectedPreferredStaff, staffId];
        
        console.log(`🎯 [DEBOUNCED CONTROLS] Staff selection updated:`, {
          previousSelection: prev.selectedPreferredStaff,
          newSelection,
          toggledStaff: staffId
        });
        
        return {
          ...prev,
          selectedPreferredStaff: newSelection
        };
      });
    }, 200),
    [setState]
  );

  const handleSkillToggle = useCallback((skill: SkillType) => {
    console.log(`🔧 [CONTROLS] Skill toggle:`, skill);
    setState(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  }, [setState]);

  const handleClientToggle = useCallback((clientId: string) => {
    console.log(`🔧 [CONTROLS] Client toggle:`, clientId);
    setState(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter(id => id !== clientId)
        : [...prev.selectedClients, clientId]
    }));
  }, [setState]);

  // DEBOUNCED: Preferred staff toggle handler
  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    console.log(`🎯 [CONTROLS] Debounced preferred staff toggle initiated for: ${staffId}`);
    debouncedStaffToggle(staffId);
  }, [debouncedStaffToggle]);

  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    console.log(`📅 [CONTROLS] Month range change:`, monthRange);
    setState(prev => ({
      ...prev,
      monthRange
    }));
  }, [setState]);

  const handleReset = useCallback(() => {
    console.log(`🔄 [CONTROLS] Resetting all filters`);
    setState(prev => ({
      ...prev,
      selectedSkills: [],
      selectedClients: [],
      selectedPreferredStaff: [],
      monthRange: { start: 0, end: 11 }
    }));
  }, [setState]);

  const handleToggleAllSkills = useCallback((allSkills: SkillType[]) => {
    setState(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.length === allSkills.length ? [] : [...allSkills]
    }));
  }, [setState]);

  const handleToggleAllClients = useCallback((allClients: Array<{ id: string; name: string }>) => {
    setState(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.length === allClients.length 
        ? [] 
        : allClients.map(c => c.id)
    }));
  }, [setState]);

  const handleToggleAllPreferredStaff = useCallback((allStaff: Array<{ id: string; name: string }>) => {
    console.log(`🎯 [CONTROLS] Toggle all preferred staff:`, { 
      currentCount: allStaff.length,
      action: 'toggle_all'
    });
    
    setState(prev => ({
      ...prev,
      selectedPreferredStaff: prev.selectedPreferredStaff.length === allStaff.length 
        ? [] 
        : allStaff.map(s => s.id)
    }));
  }, [setState]);

  return {
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle, // This now uses debouncing
    handleMonthRangeChange,
    handleReset,
    handleToggleAllSkills,
    handleToggleAllClients,
    handleToggleAllPreferredStaff
  };
};
