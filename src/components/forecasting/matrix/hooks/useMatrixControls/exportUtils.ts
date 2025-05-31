
import { useCallback } from 'react';
import { SkillType } from '@/types/task';
import { MatrixControlsState } from './types';

/**
 * Export Utilities
 * Handles CSV generation and download functionality
 */

/**
 * Generate CSV data for export
 */
export const generateCSVData = (
  state: MatrixControlsState, 
  availableSkills: SkillType[]
): string => {
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

/**
 * Download CSV file
 */
export const downloadCSV = (csvData: string, filename: string): void => {
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

/**
 * Export handler hook
 */
export const useExportHandler = (
  state: MatrixControlsState,
  availableSkills: SkillType[]
) => {
  return useCallback(() => {
    // Generate CSV data for export
    const csvData = generateCSVData(state, availableSkills);
    downloadCSV(csvData, 'capacity-matrix.csv');
  }, [state, availableSkills]);
};
