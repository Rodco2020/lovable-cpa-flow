
import { filterMatrixData } from '../../utils/matrixDataFilter';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';

describe('Matrix Data Filter Utility', () => {
  const createMockMatrixData = (): MatrixData => ({
    skills: ['Junior', 'Senior', 'CPA'] as SkillType[],
    months: [
      { key: '2024-01', label: 'Jan 2024' },
      { key: '2024-02', label: 'Feb 2024' },
      { key: '2024-03', label: 'Mar 2024' }
    ],
    dataPoints: [
      { skillType: 'Junior', month: '2024-01', monthLabel: 'Jan 2024', demandHours: 100, capacityHours: 120, gap: 20, utilizationPercent: 83 },
      { skillType: 'Senior', month: '2024-01', monthLabel: 'Jan 2024', demandHours: 80, capacityHours: 100, gap: 20, utilizationPercent: 80 },
      { skillType: 'CPA', month: '2024-01', monthLabel: 'Jan 2024', demandHours: 60, capacityHours: 80, gap: 20, utilizationPercent: 75 },
      { skillType: 'Junior', month: '2024-02', monthLabel: 'Feb 2024', demandHours: 110, capacityHours: 120, gap: 10, utilizationPercent: 92 },
      { skillType: 'Senior', month: '2024-02', monthLabel: 'Feb 2024', demandHours: 90, capacityHours: 100, gap: 10, utilizationPercent: 90 }
    ],
    totalDemand: 440,
    totalCapacity: 520,
    totalGap: 80
  });

  it('should return null for null input', () => {
    const result = filterMatrixData(null, {
      selectedSkills: [],
      monthRange: { start: 0, end: 11 }
    });

    expect(result).toBeNull();
  });

  it('should filter skills correctly', () => {
    const mockData = createMockMatrixData();
    
    const result = filterMatrixData(mockData, {
      selectedSkills: ['Junior', 'Senior'] as SkillType[],
      monthRange: { start: 0, end: 2 }
    });

    expect(result?.skills).toEqual(['Junior', 'Senior']);
    expect(result?.dataPoints).toHaveLength(4);
    expect(result?.dataPoints.every(point => 
      ['Junior', 'Senior'].includes(point.skillType)
    )).toBe(true);
  });

  it('should filter months correctly', () => {
    const mockData = createMockMatrixData();
    
    const result = filterMatrixData(mockData, {
      selectedSkills: ['Junior', 'Senior', 'CPA'] as SkillType[],
      monthRange: { start: 0, end: 0 }
    });

    expect(result?.months).toHaveLength(1);
    expect(result?.months[0].key).toBe('2024-01');
    expect(result?.dataPoints).toHaveLength(3);
    expect(result?.dataPoints.every(point => point.month === '2024-01')).toBe(true);
  });

  it('should filter both skills and months correctly', () => {
    const mockData = createMockMatrixData();
    
    const result = filterMatrixData(mockData, {
      selectedSkills: ['Junior'] as SkillType[],
      monthRange: { start: 1, end: 1 }
    });

    expect(result?.skills).toEqual(['Junior']);
    expect(result?.months).toHaveLength(1);
    expect(result?.months[0].key).toBe('2024-02');
    expect(result?.dataPoints).toHaveLength(1);
    expect(result?.dataPoints[0].skillType).toBe('Junior');
    expect(result?.dataPoints[0].month).toBe('2024-02');
  });

  it('should preserve original data structure', () => {
    const mockData = createMockMatrixData();
    
    const result = filterMatrixData(mockData, {
      selectedSkills: ['Junior', 'Senior', 'CPA'] as SkillType[],
      monthRange: { start: 0, end: 2 }
    });

    expect(result).toHaveProperty('totalDemand');
    expect(result).toHaveProperty('totalCapacity');
    expect(result).toHaveProperty('totalGap');
    expect(result?.totalDemand).toBe(mockData.totalDemand);
    expect(result?.totalCapacity).toBe(mockData.totalCapacity);
    expect(result?.totalGap).toBe(mockData.totalGap);
  });

  it('should handle empty selections', () => {
    const mockData = createMockMatrixData();
    
    const result = filterMatrixData(mockData, {
      selectedSkills: [] as SkillType[],
      monthRange: { start: 0, end: 2 }
    });

    expect(result?.skills).toEqual([]);
    expect(result?.dataPoints).toEqual([]);
    expect(result?.months).toHaveLength(3);
  });

  it('should handle out-of-range month selections', () => {
    const mockData = createMockMatrixData();
    
    const result = filterMatrixData(mockData, {
      selectedSkills: ['Junior'] as SkillType[],
      monthRange: { start: 5, end: 10 }
    });

    expect(result?.months).toEqual([]);
    expect(result?.dataPoints).toEqual([]);
  });
});
