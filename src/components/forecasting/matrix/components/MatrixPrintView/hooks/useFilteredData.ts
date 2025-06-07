
import { useMemo } from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';

export const useFilteredData = (
  matrixData: MatrixData,
  selectedSkills: SkillType[],
  monthRange: { start: number; end: number }
) => {
  return useMemo(() => {
    const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
    const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
    
    return { filteredMonths, filteredSkills };
  }, [matrixData, selectedSkills, monthRange]);
};
