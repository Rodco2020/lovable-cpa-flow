
import { useCallback } from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';

interface UseEnhancedMatrixExportProps {
  matrixData: MatrixData | null;
  selectedSkills: SkillType[];
  monthRange: { start: number; end: number };
}

interface UseEnhancedMatrixExportResult {
  handleEnhancedExport: (format: 'csv' | 'json', options: any) => void;
  handlePrint: (options: any) => void;
}

export const useEnhancedMatrixExport = ({
  matrixData,
  selectedSkills,
  monthRange
}: UseEnhancedMatrixExportProps): UseEnhancedMatrixExportResult => {
  
  const handleEnhancedExport = useCallback((format: 'csv' | 'json', options: any) => {
    if (!matrixData) return;

    // Import enhanced export utilities
    import('@/services/forecasting/enhanced/enhancedMatrixService').then(({ EnhancedMatrixService }) => {
      let exportData: string;
      
      if (format === 'csv') {
        exportData = EnhancedMatrixService.generateCSVExport(
          matrixData,
          selectedSkills,
          monthRange,
          options.includeAnalytics
        );
      } else {
        exportData = EnhancedMatrixService.generateJSONExport(
          matrixData,
          selectedSkills,
          monthRange,
          options.includeAnalytics
        );
      }

      // Download the file
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `capacity-matrix-${format}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }, [matrixData, selectedSkills, monthRange]);

  const handlePrint = useCallback((options: any) => {
    if (!matrixData) return;
    
    // This will be handled by the parent component
    console.log('Print requested with options:', options);
  }, [matrixData]);

  return {
    handleEnhancedExport,
    handlePrint
  };
};
