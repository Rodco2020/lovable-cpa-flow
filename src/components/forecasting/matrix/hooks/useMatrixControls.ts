
import { useState, useCallback } from 'react';
import { SkillType } from '@/types/task';

interface MatrixControlsState {
  selectedSkills: SkillType[];
  viewMode: 'hours' | 'percentage';
  monthRange: { start: number; end: number };
}

interface UseMatrixControlsProps {
  availableSkills: SkillType[];
  initialState?: Partial<MatrixControlsState>;
}

/**
 * Hook for managing matrix control state and actions
 */
export const useMatrixControls = ({ 
  availableSkills, 
  initialState = {} 
}: UseMatrixControlsProps) => {
  const [state, setState] = useState<MatrixControlsState>({
    selectedSkills: initialState.selectedSkills || availableSkills,
    viewMode: initialState.viewMode || 'hours',
    monthRange: initialState.monthRange || { start: 0, end: 11 }
  });

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
      selectedSkills: availableSkills,
      viewMode: 'hours',
      monthRange: { start: 0, end: 11 }
    });
  }, [availableSkills]);

  const handleExport = useCallback(() => {
    // Generate CSV data for export
    const csvData = generateCSVData(state);
    downloadCSV(csvData, 'capacity-matrix.csv');
  }, [state]);

  return {
    ...state,
    handleSkillToggle,
    handleViewModeChange,
    handleMonthRangeChange,
    handleReset,
    handleExport
  };
};

// Helper functions for export functionality
const generateCSVData = (state: MatrixControlsState): string => {
  // This would generate CSV data based on current state
  // For now, return a placeholder
  return 'Skill,Month,Demand,Capacity,Gap,Utilization\n';
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
