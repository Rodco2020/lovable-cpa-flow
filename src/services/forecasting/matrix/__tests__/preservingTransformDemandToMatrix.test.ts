
import { MatrixServiceCore } from '../MatrixServiceCore';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

/**
 * Unit Tests for preservingTransformDemandToMatrix Method
 * Tests to reproduce and isolate the skill key mapping corruption
 */
describe('MatrixServiceCore.preservingTransformDemandToMatrix', () => {
  describe('Skill Key Mapping Integrity', () => {
    it('should preserve exact demand values for each skill', () => {
      // Create test data that reproduces the corruption scenario
      const mockDemandMatrix: DemandMatrixData = {
        months: [
          { key: '2025-01', label: 'Jan 2025' },
          { key: '2025-02', label: 'Feb 2025' },
          { key: '2025-06', label: 'Jun 2025' }
        ],
        skills: ['Junior', 'Senior', 'CPA'] as SkillType[],
        dataPoints: [
          // Junior skill data
          { skillType: 'Junior' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 100, taskCount: 5, clientCount: 2, taskBreakdown: [] },
          { skillType: 'Junior' as SkillType, month: '2025-02', monthLabel: 'Feb 2025', demandHours: 120, taskCount: 6, clientCount: 3, taskBreakdown: [] },
          { skillType: 'Junior' as SkillType, month: '2025-06', monthLabel: 'Jun 2025', demandHours: 80, taskCount: 4, clientCount: 2, taskBreakdown: [] },
          // Senior skill data
          { skillType: 'Senior' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 150, taskCount: 3, clientCount: 2, taskBreakdown: [] },
          { skillType: 'Senior' as SkillType, month: '2025-02', monthLabel: 'Feb 2025', demandHours: 180, taskCount: 4, clientCount: 3, taskBreakdown: [] },
          { skillType: 'Senior' as SkillType, month: '2025-06', monthLabel: 'Jun 2025', demandHours: 200, taskCount: 5, clientCount: 3, taskBreakdown: [] },
          // CPA skill data
          { skillType: 'CPA' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 50, taskCount: 2, clientCount: 1, taskBreakdown: [] },
          { skillType: 'CPA' as SkillType, month: '2025-02', monthLabel: 'Feb 2025', demandHours: 60, taskCount: 2, clientCount: 1, taskBreakdown: [] },
          { skillType: 'CPA' as SkillType, month: '2025-06', monthLabel: 'Jun 2025', demandHours: 70, taskCount: 3, clientCount: 2, taskBreakdown: [] }
        ],
        totalDemand: 1010, // Sum of all demand hours
        totalTasks: 34,
        totalClients: 7,
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map()
      };

      const mockCapacityForecast = [
        {
          period: '2025-01',
          capacity: [
            { skill: 'Junior', hours: 90 },
            { skill: 'Senior', hours: 140 },
            { skill: 'CPA', hours: 60 }
          ]
        },
        {
          period: '2025-02',
          capacity: [
            { skill: 'Junior', hours: 110 },
            { skill: 'Senior', hours: 170 },
            { skill: 'CPA', hours: 50 }
          ]
        },
        {
          period: '2025-06',
          capacity: [
            { skill: 'Junior', hours: 85 },
            { skill: 'Senior', hours: 190 },
            { skill: 'CPA', hours: 80 }
          ]
        }
      ];

      // Access the private method using bracket notation for testing
      const result = (MatrixServiceCore as any).preservingTransformDemandToMatrix(
        mockDemandMatrix,
        mockCapacityForecast
      );

      // Validate total demand preservation
      expect(result.totalDemand).toBe(mockDemandMatrix.totalDemand);

      // Validate skill-specific demand preservation
      const skillDemandSums = {
        Junior: 300, // 100 + 120 + 80
        Senior: 530, // 150 + 180 + 200
        CPA: 180    // 50 + 60 + 70
      };

      Object.entries(skillDemandSums).forEach(([skill, expectedDemand]) => {
        const actualDemand = result.dataPoints
          .filter(dp => dp.skillType === skill)
          .reduce((sum, dp) => sum + dp.demandHours, 0);
        
        expect(actualDemand).toBe(expectedDemand);
      });

      // Validate data point count
      const expectedDataPoints = mockDemandMatrix.skills.length * mockDemandMatrix.months.length;
      expect(result.dataPoints.length).toBe(expectedDataPoints);
    });

    it('should handle skills with whitespace correctly', () => {
      // Test with skills that have whitespace issues
      const mockDemandMatrix: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: [' Junior ', 'Senior', ' CPA'] as SkillType[], // Skills with whitespace
        dataPoints: [
          { skillType: ' Junior ' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 100, taskCount: 1, clientCount: 1, taskBreakdown: [] },
          { skillType: 'Senior' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 150, taskCount: 1, clientCount: 1, taskBreakdown: [] },
          { skillType: ' CPA' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 50, taskCount: 1, clientCount: 1, taskBreakdown: [] }
        ],
        totalDemand: 300,
        totalTasks: 3,
        totalClients: 3,
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map()
      };

      const mockCapacityForecast = [
        {
          period: '2025-01',
          capacity: [
            { skill: 'Junior', hours: 90 }, // No whitespace in capacity
            { skill: 'Senior', hours: 140 },
            { skill: 'CPA', hours: 60 }
          ]
        }
      ];

      const result = (MatrixServiceCore as any).preservingTransformDemandToMatrix(
        mockDemandMatrix,
        mockCapacityForecast
      );

      // Total demand should still be preserved
      expect(result.totalDemand).toBe(300);

      // Each skill's demand should be preserved despite whitespace
      const juniorDemand = result.dataPoints
        .filter(dp => String(dp.skillType).trim() === 'Junior')
        .reduce((sum, dp) => sum + dp.demandHours, 0);
      expect(juniorDemand).toBe(100);

      const cpaDemand = result.dataPoints
        .filter(dp => String(dp.skillType).trim() === 'CPA')
        .reduce((sum, dp) => sum + dp.demandHours, 0);
      expect(cpaDemand).toBe(50);
    });

    it('should maintain skill mapping consistency across transformations', () => {
      const mockDemandMatrix: DemandMatrixData = {
        months: [
          { key: '2025-01', label: 'Jan 2025' },
          { key: '2025-02', label: 'Feb 2025' }
        ],
        skills: ['Junior', 'Senior'] as SkillType[],
        dataPoints: [
          { skillType: 'Junior' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 100, taskCount: 1, clientCount: 1, taskBreakdown: [] },
          { skillType: 'Junior' as SkillType, month: '2025-02', monthLabel: 'Feb 2025', demandHours: 120, taskCount: 1, clientCount: 1, taskBreakdown: [] },
          { skillType: 'Senior' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 150, taskCount: 1, clientCount: 1, taskBreakdown: [] },
          { skillType: 'Senior' as SkillType, month: '2025-02', monthLabel: 'Feb 2025', demandHours: 180, taskCount: 1, clientCount: 1, taskBreakdown: [] }
        ],
        totalDemand: 550,
        totalTasks: 4,
        totalClients: 2,
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map()
      };

      const mockCapacityForecast = [
        {
          period: '2025-01',
          capacity: [
            { skill: 'Junior', hours: 90 },
            { skill: 'Senior', hours: 140 }
          ]
        },
        {
          period: '2025-02',
          capacity: [
            { skill: 'Junior', hours: 110 },
            { skill: 'Senior', hours: 170 }
          ]
        }
      ];

      const result = (MatrixServiceCore as any).preservingTransformDemandToMatrix(
        mockDemandMatrix,
        mockCapacityForecast
      );

      // Verify each data point has correct mapping
      result.dataPoints.forEach(dataPoint => {
        const originalDataPoint = mockDemandMatrix.dataPoints.find(
          dp => dp.skillType === dataPoint.skillType && dp.month === dataPoint.month
        );
        
        expect(originalDataPoint).toBeDefined();
        expect(dataPoint.demandHours).toBe(originalDataPoint!.demandHours);
      });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty capacity forecast gracefully', () => {
      const mockDemandMatrix: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Junior'] as SkillType[],
        dataPoints: [
          { skillType: 'Junior' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 100, taskCount: 1, clientCount: 1, taskBreakdown: [] }
        ],
        totalDemand: 100,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map()
      };

      const result = (MatrixServiceCore as any).preservingTransformDemandToMatrix(
        mockDemandMatrix,
        [] // Empty capacity forecast
      );

      expect(result.totalDemand).toBe(100);
      expect(result.totalCapacity).toBe(0);
      expect(result.dataPoints[0].demandHours).toBe(100);
      expect(result.dataPoints[0].capacityHours).toBe(0);
    });

    it('should handle mismatched skills between demand and capacity', () => {
      const mockDemandMatrix: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Junior', 'Senior'] as SkillType[],
        dataPoints: [
          { skillType: 'Junior' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 100, taskCount: 1, clientCount: 1, taskBreakdown: [] },
          { skillType: 'Senior' as SkillType, month: '2025-01', monthLabel: 'Jan 2025', demandHours: 150, taskCount: 1, clientCount: 1, taskBreakdown: [] }
        ],
        totalDemand: 250,
        totalTasks: 2,
        totalClients: 2,
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map()
      };

      const mockCapacityForecast = [
        {
          period: '2025-01',
          capacity: [
            { skill: 'Junior', hours: 90 },
            { skill: 'Manager', hours: 80 } // Different skill not in demand
          ]
        }
      ];

      const result = (MatrixServiceCore as any).preservingTransformDemandToMatrix(
        mockDemandMatrix,
        mockCapacityForecast
      );

      // Demand should still be preserved
      expect(result.totalDemand).toBe(250);
      
      // Should include all skills from both demand and capacity
      expect(result.skills).toContain('Junior');
      expect(result.skills).toContain('Senior');
      expect(result.skills).toContain('Manager');
    });
  });
});
