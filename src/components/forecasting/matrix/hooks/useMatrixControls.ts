
import { useState, useCallback, useEffect } from 'react';
import { SkillType } from '@/types/task';
import { useMatrixSkills } from './useMatrixSkills';
import { SkillsIntegrationService } from '@/services/forecasting/skillsIntegrationService';
import { debugLog } from '@/services/forecasting/logger';

interface MatrixControlsState {
  selectedSkills: SkillType[];
  viewMode: 'hours' | 'percentage';
  monthRange: { start: number; end: number };
}

interface UseMatrixControlsProps {
  initialState?: Partial<MatrixControlsState>;
  matrixSkills?: SkillType[]; // Skills from matrix data for synchronization
}

/**
 * Hook for managing matrix control state with enhanced skills synchronization
 */
export const useMatrixControls = ({ 
  initialState = {},
  matrixSkills = []
}: UseMatrixControlsProps = {}) => {
  const { availableSkills, isLoading: skillsLoading } = useMatrixSkills();
  
  const [state, setState] = useState<MatrixControlsState>({
    selectedSkills: initialState.selectedSkills || [],
    viewMode: initialState.viewMode || 'hours',
    monthRange: initialState.monthRange || { start: 0, end: 11 }
  });

  // Synchronize selected skills with both available skills and matrix skills
  useEffect(() => {
    if (!skillsLoading && availableSkills.length > 0) {
      setState(prev => {
        // Combine available skills and matrix skills for comprehensive skill set
        const allRelevantSkills = new Set([...availableSkills, ...matrixSkills]);
        const skillsArray = Array.from(allRelevantSkills);
        
        // If no skills selected yet, select all relevant skills
        if (prev.selectedSkills.length === 0) {
          debugLog('Auto-selecting all relevant skills', { count: skillsArray.length });
          return {
            ...prev,
            selectedSkills: skillsArray
          };
        }

        // Validate and normalize current selection
        const validSelectedSkills = prev.selectedSkills.filter(skill => 
          allRelevantSkills.has(skill)
        );
        
        // Only update if there's a meaningful change
        if (validSelectedSkills.length !== prev.selectedSkills.length) {
          debugLog('Updated selected skills after validation', { 
            before: prev.selectedSkills.length, 
            after: validSelectedSkills.length 
          });
          return { ...prev, selectedSkills: validSelectedSkills };
        }
        
        return prev;
      });
    }
  }, [availableSkills, skillsLoading, matrixSkills]);

  const handleSkillToggle = useCallback((skill: SkillType) => {
    setState(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  }, []);

  const handleViewModeChange = useCallback((viewMode: 'hours' | 'percentage') => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  const handleMonthRangeChange = useCallback((monthRange: { start: number; end: number }) => {
    setState(prev => ({ ...prev, monthRange }));
  }, []);

  const handleReset = useCallback(async () => {
    // Use all relevant skills (available + matrix) for reset
    const allRelevantSkills = new Set([...availableSkills, ...matrixSkills]);
    const skillsArray = Array.from(allRelevantSkills);
    
    setState({
      selectedSkills: skillsArray,
      viewMode: 'hours',
      monthRange: { start: 0, end: 11 }
    });
  }, [availableSkills, matrixSkills]);

  const handleExport = useCallback(() => {
    // Generate CSV data for export
    const csvData = generateCSVData(state, availableSkills);
    downloadCSV(csvData, 'capacity-matrix.csv');
  }, [state, availableSkills]);

  // Get effective skills list (combination of available and matrix skills)
  const getEffectiveSkills = useCallback(() => {
    const allSkills = new Set([...availableSkills, ...matrixSkills]);
    return Array.from(allSkills).sort();
  }, [availableSkills, matrixSkills]);

  return {
    ...state,
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    // Expose skills data for consumers
    availableSkills: getEffectiveSkills(),
    skillsLoading
  };
};

// Helper functions for export functionality
const generateCSVData = (state: MatrixControlsState, availableSkills: SkillType[]): string => {
  const headers = ['Skill', 'Month', 'Demand', 'Capacity', 'Gap', 'Utilization'];
  const rows = [headers.join(',')];
  
  // Add placeholder data - in real implementation this would use actual matrix data
  state.selectedSkills.forEach(skill => {
    for (let i = state.monthRange.start; i <= state.monthRange.end; i++) {
      const month = new Date(2025, i).toLocaleDateString('en-US', { month: 'short' });
      rows.push(`${skill},${month},0,0,0,0`);
    }
  });
  
  return rows.join('\n');
};

const downloadCSV = (csvData: string, filename: string): void => {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default useMatrixControls;
