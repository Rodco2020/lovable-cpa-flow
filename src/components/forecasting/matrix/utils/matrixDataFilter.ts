
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';

interface FilterOptions {
  selectedSkills: SkillType[];
  monthRange: { start: number; end: number };
}

/**
 * Filter matrix data based on selected skills and month range
 * 
 * This utility function filters the matrix data while maintaining
 * the correct data structure and recalculating totals.
 */
export const filterMatrixData = (
  matrixData: MatrixData | null,
  options: FilterOptions
): MatrixData | null => {
  if (!matrixData) {
    return null;
  }

  const { selectedSkills, monthRange } = options;

  // If no filters applied, return original data
  if (selectedSkills.length === 0 && monthRange.start === 0 && monthRange.end >= 11) {
    return matrixData;
  }

  // Filter skills
  const filteredSkills = selectedSkills.length > 0 
    ? matrixData.skills.filter(skill => selectedSkills.includes(skill))
    : matrixData.skills;

  // Filter months based on range
  const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);

  // Filter data points based on filtered skills and months
  const filteredDataPoints = matrixData.dataPoints.filter(dataPoint => {
    const skillMatch = filteredSkills.includes(dataPoint.skillType);
    const monthMatch = filteredMonths.some(month => month.key === dataPoint.month);
    return skillMatch && monthMatch;
  });

  // Recalculate totals
  const totalDemand = filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
  const totalCapacity = filteredDataPoints.reduce((sum, dp) => sum + dp.capacityHours, 0);
  const totalGap = filteredDataPoints.reduce((sum, dp) => sum + dp.gap, 0);

  return {
    skills: filteredSkills,
    months: filteredMonths,
    dataPoints: filteredDataPoints,
    totalDemand,
    totalCapacity,
    totalGap
  };
};
