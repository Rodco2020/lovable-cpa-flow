
import { SkillType } from '@/types/task';
import { MatrixData } from '@/services/forecasting/matrixUtils';

export const getDataPoint = (
  matrixData: MatrixData,
  skill: SkillType,
  monthKey: string
) => {
  return matrixData.dataPoints.find(
    point => point.skillType === skill && point.month === monthKey
  );
};

export const calculateTotalHours = (
  matrixData: MatrixData,
  selectedSkills: SkillType[],
  type: 'capacity' | 'demand' | 'gap'
) => {
  return matrixData.dataPoints
    .filter(p => selectedSkills.includes(p.skillType))
    .reduce((sum, p) => {
      switch (type) {
        case 'capacity':
          return sum + p.capacityHours;
        case 'demand':
          return sum + p.demandHours;
        case 'gap':
          return sum + p.gap;
        default:
          return sum;
      }
    }, 0);
};
