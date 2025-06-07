
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { filterMatrixData } from '../utils/matrixDataFilter';

describe('Matrix Data Filter Utils', () => {
  const mockMatrixData: MatrixData = {
    skills: ['Junior', 'Senior', 'CPA'],
    months: [
      { key: '2024-01', label: 'Jan 2024' },
      { key: '2024-02', label: 'Feb 2024' },
      { key: '2024-03', label: 'Mar 2024' }
    ],
    dataPoints: [
      { skill: 'Junior', month: '2024-01', demand: 100, capacity: 120, gap: -20 },
      { skill: 'Senior', month: '2024-01', demand: 80, capacity: 100, gap: -20 },
      { skill: 'CPA', month: '2024-01', demand: 60, capacity: 80, gap: -20 },
      { skill: 'Junior', month: '2024-02', demand: 110, capacity: 120, gap: -10 },
      { skill: 'Senior', month: '2024-02', demand: 90, capacity: 100, gap: -10 },
      { skill: 'CPA', month: '2024-02', demand: 70, capacity: 80, gap: -10 }
    ],
    totalDemand: 510,
    totalCapacity: 600,
    totalGap: -90
  };

  describe('filterMatrixData', () => {
    it('should return original data when no filters applied', () => {
      const result = filterMatrixData(mockMatrixData, {
        selectedSkills: [],
        monthRange: { start: 0, end: 11 }
      });

      expect(result).toEqual(mockMatrixData);
    });

    it('should filter by selected skills correctly', () => {
      const result = filterMatrixData(mockMatrixData, {
        selectedSkills: ['Junior', 'Senior'],
        monthRange: { start: 0, end: 11 }
      });

      expect(result.skills).toEqual(['Junior', 'Senior']);
      expect(result.dataPoints).toHaveLength(4);
      expect(result.dataPoints.every(dp => ['Junior', 'Senior'].includes(dp.skill))).toBe(true);
    });

    it('should filter by month range correctly', () => {
      const result = filterMatrixData(mockMatrixData, {
        selectedSkills: [],
        monthRange: { start: 0, end: 0 } // Only first month
      });

      expect(result.months).toHaveLength(1);
      expect(result.months[0].key).toBe('2024-01');
      expect(result.dataPoints).toHaveLength(3);
      expect(result.dataPoints.every(dp => dp.month === '2024-01')).toBe(true);
    });

    it('should apply both skill and month filters', () => {
      const result = filterMatrixData(mockMatrixData, {
        selectedSkills: ['Junior'],
        monthRange: { start: 0, end: 1 } // First two months
      });

      expect(result.skills).toEqual(['Junior']);
      expect(result.months).toHaveLength(2);
      expect(result.dataPoints).toHaveLength(2);
      expect(result.dataPoints.every(dp => dp.skill === 'Junior')).toBe(true);
      expect(result.dataPoints.every(dp => ['2024-01', '2024-02'].includes(dp.month))).toBe(true);
    });

    it('should recalculate totals correctly after filtering', () => {
      const result = filterMatrixData(mockMatrixData, {
        selectedSkills: ['Junior'],
        monthRange: { start: 0, end: 1 }
      });

      expect(result.totalDemand).toBe(210); // 100 + 110
      expect(result.totalCapacity).toBe(240); // 120 + 120
      expect(result.totalGap).toBe(-30); // -20 + -10
    });

    it('should handle empty filter results', () => {
      const result = filterMatrixData(mockMatrixData, {
        selectedSkills: ['NonExistentSkill'],
        monthRange: { start: 0, end: 11 }
      });

      expect(result.skills).toEqual([]);
      expect(result.dataPoints).toHaveLength(0);
      expect(result.totalDemand).toBe(0);
      expect(result.totalCapacity).toBe(0);
      expect(result.totalGap).toBe(0);
    });

    it('should handle null matrix data gracefully', () => {
      const result = filterMatrixData(null, {
        selectedSkills: ['Junior'],
        monthRange: { start: 0, end: 11 }
      });

      expect(result).toBeNull();
    });
  });
});
