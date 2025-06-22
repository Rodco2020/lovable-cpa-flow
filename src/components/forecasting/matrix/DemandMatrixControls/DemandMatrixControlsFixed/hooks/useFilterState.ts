
import { useState, useCallback } from 'react';
import { FilterState } from '../types';

/**
 * Hook for managing filter state
 * Preserves exact functionality from DemandMatrixControlsFixed
 */
export const useFilterState = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedPreferredStaff, setSelectedPreferredStaff] = useState<string[]>([]);
  const [monthRange, setMonthRange] = useState({ start: 0, end: 5 });
  const [preferredStaffFilterMode, setPreferredStaffFilterMode] = useState<'all' | 'specific' | 'none'>('all');

  const handleSkillToggle = useCallback((skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  }, []);

  const handleClientToggle = useCallback((clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(c => c !== clientId)
        : [...prev, clientId]
    );
  }, []);

  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    setSelectedPreferredStaff(prev => 
      prev.includes(staffId)
        ? prev.filter(s => s !== staffId)
        : [...prev, staffId]
    );
  }, []);

  const handleReset = useCallback(() => {
    console.log('🔄 [FIXED] Resetting all filters');
    setSelectedSkills([]);
    setSelectedClients([]);
    setSelectedPreferredStaff([]);
    setPreferredStaffFilterMode('all');
    setMonthRange({ start: 0, end: 5 });
  }, []);

  const getFilterState = useCallback((): FilterState => ({
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    preferredStaffFilterMode
  }), [selectedSkills, selectedClients, selectedPreferredStaff, monthRange, preferredStaffFilterMode]);

  return {
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    monthRange,
    preferredStaffFilterMode,
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle,
    setMonthRange,
    setPreferredStaffFilterMode,
    handleReset,
    getFilterState
  };
};
