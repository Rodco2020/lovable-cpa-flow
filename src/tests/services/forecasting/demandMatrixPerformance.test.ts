
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandAnalyticsService } from '@/services/forecasting/analytics/demandAnalyticsService';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

// Mock large dataset generation
const generateLargeDataset = (
  skillCount: number,
  clientCount: number,
  taskCount: number
): DemandMatrixData => {
  const skills: SkillType[] = Array.from({ length: skillCount }, (_, i) => `Skill ${i + 1}`);
  const months = Array.from({ length: 12 }, (_, i) => ({
    key: `2025-${(i + 1).toString().padStart(2, '0')}`,
    label: `Month ${i + 1}`
  }));

  const dataPoints = [];
  for (const skill of skills) {
    for (const month of months) {
      const taskBreakdown = Array.from({ length: taskCount }, (_, i) => ({
        clientId: `client-${(i % clientCount) + 1}`,
        clientName: `Client ${(i % clientCount) + 1}`,
        recurringTaskId: `task-${i + 1}`,
        taskName: `Task ${i + 1}`,
        skillType: skill,
        estimatedHours: Math.random() * 20 + 5,
        recurrencePattern: { type: 'Monthly', frequency: 1 },
        monthlyHours: Math.random() * 10 + 2
      }));

      dataPoints.push({
        skillType: skill,
        month: month.key,
        monthLabel: month.label,
        demandHours: taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0),
        taskCount: taskBreakdown.length,
        clientCount: new Set(taskBreakdown.map(t => t.clientId)).size,
        taskBreakdown
      });
    }
  }

  return {
    months,
    skills,
    dataPoints,
    totalDemand: dataPoints.reduce((sum, point) => sum + point.demandHours, 0),
    totalTasks: taskCount,
    totalClients: clientCount,
    skillSummary: {}
  };
};

describe('Demand Matrix Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Large Dataset Validation', () => {
    it('should validate large dataset efficiently', () => {
      const largeDataset = generateLargeDataset(50, 100, 500); // 50 skills, 100 clients, 500 tasks
      
      const startTime = Date.now();
      const issues = DemandMatrixService.validateDemandMatrixData(largeDataset);
      const validationTime = Date.now() - startTime;
      
      // Validation should complete within reasonable time (< 1 second)
      expect(validationTime).toBeLessThan(1000);
      
      // Should have no validation issues for well-formed data
      expect(issues).toHaveLength(0);
    });

    it('should handle extreme dataset sizes', () => {
      const extremeDataset = generateLargeDataset(20, 50, 200); // More realistic but still large
      
      const startTime = Date.now();
      
      // Test validation performance
      const issues = DemandMatrixService.validateDemandMatrixData(extremeDataset);
      
      // Test analytics performance
      const analytics = DemandAnalyticsService.generateDemandAnalytics(extremeDataset);
      
      const totalTime = Date.now() - startTime;
      
      // Combined operations should complete within 2 seconds
      expect(totalTime).toBeLessThan(2000);
      
      // Should generate analytics for all skills
      expect(analytics.trendAnalysis).toHaveLength(20);
      expect(analytics.skillUtilization).toHaveLength(20);
      expect(analytics.clientDistribution.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Performance', () => {
    it('should generate analytics efficiently for large datasets', () => {
      const dataset = generateLargeDataset(30, 75, 300);
      
      const startTime = Date.now();
      const analytics = DemandAnalyticsService.generateDemandAnalytics(dataset);
      const analyticsTime = Date.now() - startTime;
      
      // Analytics should complete within 500ms
      expect(analyticsTime).toBeLessThan(500);
      
      // Should provide comprehensive analytics
      expect(analytics.trendAnalysis).toHaveLength(30);
      expect(analytics.skillUtilization).toHaveLength(30);
      expect(analytics.seasonality).toHaveLength(12);
      expect(analytics.clientDistribution.length).toBeGreaterThan(0);
    });

    it('should handle memory efficiently with large client distributions', () => {
      const dataset = generateLargeDataset(10, 200, 1000); // Many clients and tasks
      
      const memoryBefore = process.memoryUsage().heapUsed;
      
      const analytics = DemandAnalyticsService.generateDemandAnalytics(dataset);
      
      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryIncrease = memoryAfter - memoryBefore;
      
      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      // Should handle all clients
      expect(analytics.clientDistribution.length).toBeLessThanOrEqual(200);
      
      // Should be sorted by total hours
      const totals = analytics.clientDistribution.map(c => c.totalHours);
      expect(totals).toEqual([...totals].sort((a, b) => b - a));
    });
  });

  describe('Cache Performance', () => {
    it('should cache and retrieve large datasets efficiently', async () => {
      // Mock the dependency modules for this test
      vi.doMock('@/services/forecasting/demand', () => ({
        ForecastGenerator: {
          generateDemandForecast: vi.fn(() => Promise.resolve(
            Array.from({ length: 12 }, (_, i) => ({
              period: `2025-${(i + 1).toString().padStart(2, '0')}`,
              demand: [
                { skill: 'Tax Preparation', hours: 100 },
                { skill: 'Audit', hours: 80 },
                { skill: 'Advisory', hours: 120 }
              ],
              capacity: [],
              demandHours: 300,
              capacityHours: 0
            }))
          ))
        },
        DataFetcher: {
          fetchClientAssignedTasks: vi.fn(() => Promise.resolve(
            Array.from({ length: 100 }, (_, i) => ({
              id: `task-${i}`,
              name: `Task ${i}`,
              client_id: `client-${i % 20}`,
              required_skills: ['Tax Preparation', 'Audit', 'Advisory'][i % 3],
              estimated_hours: 10,
              recurrence_type: 'Monthly',
              is_active: true,
              clients: { legal_name: `Client ${i % 20}` }
            }))
          ))
        },
        MatrixTransformer: {
          transformToMatrixData: vi.fn(() => generateLargeDataset(3, 20, 100))
        }
      }));

      // First generation (cache miss)
      const startTime1 = Date.now();
      const result1 = await DemandMatrixService.generateDemandMatrix('demand-only');
      const time1 = Date.now() - startTime1;
      
      // Second generation (cache hit)
      const startTime2 = Date.now();
      const result2 = await DemandMatrixService.generateDemandMatrix('demand-only');
      const time2 = Date.now() - startTime2;
      
      // Cache hit should be significantly faster
      expect(time2).toBeLessThan(time1 / 2);
      
      // Results should be identical
      expect(result2.matrixData.totalDemand).toBe(result1.matrixData.totalDemand);
    });
  });
});
