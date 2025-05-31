
import { useState, useCallback, useEffect } from 'react';
import { SkillType } from '@/types/task';
import { useMatrixSkills } from './useMatrixSkills';

interface MatrixControlsState {
  selectedSkills: SkillType[];
  viewMode: 'hours' | 'percentage';
  monthRange: { start: number; end: number };
}

interface UseMatrixControlsProps {
  initialState?: Partial<MatrixControlsState>;
}

/**
 * Hook for managing matrix control state with dynamic skills integration
 */
export const useMatrixControls = ({ 
  initialState = {} 
}: UseMatrixControlsProps = {}) => {
  const { availableSkills, isLoading: skillsLoading } = useMatrixSkills();
  
  const [state, setState] = useState<MatrixControlsState>({
    selectedSkills: initialState.selectedSkills || [],
    viewMode: initialState.viewMode || 'hours',
    monthRange: initialState.monthRange || { start: 0, end: 11 }
  });

  // Auto-select all available skills when they load
  useEffect(() => {
    if (!skillsLoading && availableSkills.length > 0 && state.selectedSkills.length === 0) {
      setState(prev => ({
        ...prev,
        selectedSkills: [...availableSkills]
      }));
    }
  }, [availableSkills, skillsLoading, state.selectedSkills.length]);

  // Validate and sync selected skills with available skills
  useEffect(() => {
    if (availableSkills.length > 0) {
      setState(prev => {
        const validSelectedSkills = prev.selectedSkills.filter(skill => 
          availableSkills.includes(skill)
        );
        
        // Only update if there's a difference
        if (validSelectedSkills.length !== prev.selectedSkills.length) {
          return { ...prev, selectedSkills: validSelectedSkills };
        }
        
        return prev;
      });
    }
  }, [availableSkills]);

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

  const handleReset = useCallback(() => {
    setState({
      selectedSkills: [...availableSkills],
      viewMode: 'hours',
      monthRange: { start: 0, end: 11 }
    });
  }, [availableSkills]);

  const handleExport = useCallback(() => {
    // Generate CSV data for export
    const csvData = generateCSVData(state, availableSkills);
    downloadCSV(csvData, 'capacity-matrix.csv');
  }, [state, availableSkills]);

  return {
    ...state,
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset,
    handleExport,
    // Expose skills data for consumers
    availableSkills,
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
