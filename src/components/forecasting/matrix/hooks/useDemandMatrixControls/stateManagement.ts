
import { useState, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixControlsState } from './types';

/**
 * Hook for managing demand matrix controls state
 * Encapsulates all state management logic for better maintainability
 */
export const useControlsState = () => {
  // Core state management
  const [monthRange, setMonthRange] = useState({ start: 0, end: 11 });
  const [selectedSkills, setSelectedSkills] = useState<SkillType[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedPreferredStaff, setSelectedPreferredStaff] = useState<string[]>([]);
  const [preferredStaffFilterMode, setPreferredStaffFilterMode] = useState<'all' | 'specific' | 'none'>('all');

  // Event handlers with useCallback for performance optimization
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  }, []);

  const handleClientToggle = useCallback((clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  }, []);

  const handlePreferredStaffToggle = useCallback((staffId: string) => {
    setSelectedPreferredStaff(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  }, []);

  const handlePreferredStaffFilterModeChange = useCallback((mode: 'all' | 'specific' | 'none') => {
    setPreferredStaffFilterMode(mode);
    if (mode === 'all' || mode === 'none') {
      setSelectedPreferredStaff([]);
    }
  }, []);

  const handleMonthRangeChange = useCallback((range: { start: number; end: number }) => {
    setMonthRange(range);
  }, []);

  const handleReset = useCallback(() => {
    console.log('🔄 [CONTROLS STATE] Resetting all filters');
    setSelectedSkills([]);
    setSelectedClients([]);
    setSelectedPreferredStaff([]);
    setPreferredStaffFilterMode('all');
    setMonthRange({ start: 0, end: 11 });
  }, []);

  // Current state getter
  const getCurrentState = useCallback((): DemandMatrixControlsState => ({
    monthRange,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    preferredStaffFilterMode
  }), [monthRange, selectedSkills, selectedClients, selectedPreferredStaff, preferredStaffFilterMode]);

  return {
    // State values
    monthRange,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff,
    preferredStaffFilterMode,
    
    // Event handlers
    handleSkillToggle,
    handleClientToggle,
    handlePreferredStaffToggle,
    handlePreferredStaffFilterModeChange,
    handleMonthRangeChange,
    handleReset,
    
    // Utility
    getCurrentState
  };
};
