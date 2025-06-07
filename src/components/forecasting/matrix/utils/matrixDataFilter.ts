
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';

export interface MatrixDataFilterOptions {
  selectedSkills: SkillType[];
  monthRange: { start: number; end: number };
}

/**
 * Filter matrix data based on selected skills and month range
 */
export const filterMatrixData = (
  matrixData: MatrixData | null,
  options: MatrixDataFilterOptions
): MatrixData | null => {
  if (!matrixData) return null;

  const { selectedSkills, monthRange } = options;

  const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
  const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
  const filteredDataPoints = matrixData.dataPoints.filter(
    point => 
      selectedSkills.includes(point.skillType) &&
      filteredMonths.some(month => month.key === point.month)
  );

  return {
    ...matrixData,
    months: filteredMonths,
    skills: filteredSkills,
    dataPoints: filteredDataPoints
  };
};
