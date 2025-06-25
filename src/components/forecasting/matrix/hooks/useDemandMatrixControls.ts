
import { useState, useEffect, useCallback } from 'react';
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { useClients } from '@/hooks/useClients';
import { useSkills } from '@/hooks/useSkills';
import { useMatrixFiltering } from './useMatrixFiltering';
import { useMatrixExport } from './useMatrixExport';

interface UseDemandMatrixControlsProps {
  demandData?: DemandMatrixData | null;
  groupingMode: 'skill' | 'client';
}

interface DemandMatrixControlsState {
  selectedSkills: SkillType[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
}

/**
 * Hook for managing demand matrix controls UI state
 * 
 * Focused on UI state management and user interactions.
 * Delegates filtering logic to useMatrixFiltering and export logic to useMatrixExport.
 * Maintains exact same functionality as the original implementation.
 */
export const useDemandMatrixControls = ({ 
  demandData, 
  groupingMode 
}: UseDemandMatrixControlsProps) => {
  // Initialize UI state
  const [state, setState] = useState<DemandMatrixControlsState>({
    selectedSkills: [],
    selectedClients: [],
    monthRange: { start: 0, end: 11 }
  });

  // Fetch external data for loading states
  const { data: skillsData, isLoading: skillsLoading } = useSkills();
  const { data: clientsData, isLoading: clientsLoading } = useClients();

  // Use filtering logic hook
  const {
    availableSkills,
    availableClients,
    isAllSkillsSelected,
    isAllClientsSelected
  } = useMatrixFiltering({
    demandData,
    selectedSkills: state.selectedSkills,
    selectedClients: state.selectedClients,
    monthRange: state.monthRange,
    groupingMode
  });

  // Use export functionality hook
  const { handleExport } = useMatrixExport({
    demandData,
    selectedSkills: state.selectedSkills,
    selectedClients: state.selectedClients,
    monthRange: state.monthRange,
    groupingMode,
    availableSkills,
    availableClients,
    isAllSkillsSelected,
    isAllClientsSelected
  });

  // Initialize selections when data becomes available - SELECT ALL by default
  useEffect(() => {
    if (demandData && state.selectedSkills.length === 0 && state.selectedClients.length === 0) {
      setState(prev => ({
        ...prev,
        selectedSkills: availableSkills,
        selectedClients: availableClients.map(client => client.id)
      }));
      
      console.log(`🎛️ [MATRIX CONTROLS] Initialized with ALL skills and clients selected:`, {
        skillsCount: availableSkills.length,
        clientsCount: availableClients.length
      });
    }
  }, [demandData, availableSkills, availableClients]);

  // Handle skill toggle
  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => {
      const newSelectedSkills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill];
      
      console.log(`🔧 [MATRIX CONTROLS] Skill toggle:`, {
        skill,
        action: prev.selectedSkills.includes(skill) ? 'removed' : 'added',
        newCount: newSelectedSkills.length,
        totalAvailable: availableSkills.length,
        willBeAllSelected: newSelectedSkills.length === availableSkills.length
      });

      return {
        ...prev,
        selectedSkills: newSelectedSkills
      };
    });
  }, [availableSkills.length]);

  // Handle client toggle
  const handleClientToggle = useCallback((clientId: string) => {
    setState(prev => {
      const newSelectedClients = prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter(c => c !== clientId)
        : [...prev.selectedClients, clientId];

      console.log(`🔧 [MATRIX CONTROLS] Client toggle:`, {
        clientId,
        action: prev.selectedClients.includes(clientId) ? 'removed' : 'added',
        newCount: newSelectedClients.length,
        totalAvailable: availableClients.length,
        willBeAllSelected: newSelectedClients.length === availableClients.length
      });

      return {
        ...prev,
        selectedClients: newSelectedClients
      };
    });
  }, [availableClients.length]);

  // Handle month range change
  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({
      ...prev,
      monthRange
    }));
  }, []);

  // Handle reset - SELECT ALL clients and skills
  const handleReset = useCallback(() => {
    setState({
      selectedSkills: availableSkills,
      selectedClients: availableClients.map(client => client.id),
      monthRange: { start: 0, end: 11 }
    });
    
    console.log(`🔄 [MATRIX CONTROLS] Reset to ALL skills and clients:`, {
      skillsCount: availableSkills.length,
      clientsCount: availableClients.length
    });
  }, [availableSkills, availableClients]);

  return {
    ...state,
    handleSkillToggle,
    handleClientToggle,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    availableSkills,
    availableClients,
    skillsLoading,
    clientsLoading,
    isAllSkillsSelected,
    isAllClientsSelected
  };
};
