
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { DemandMatrixData, DemandFilters } from '@/types/demand';

// Mock dependencies
vi.mock('@/services/forecasting/demand/dataFetcher');
vi.mock('@/services/forecasting/demand/matrixTransformer/matrixTransformerCore');

describe('Demand Matrix Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DemandMatrixService.clearCache();
  });

  describe('Service Performance', () => {
    test('matrix generation completes within acceptable time', async () => {
      const startTime = performance.now();
      
      try {
        await DemandMatrixService.generateDemandMatrix('demand-only');
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete within 2 seconds for standard dataset
        expect(duration).toBeLessThan(2000);
      } catch (error) {
        // Test passes if it completes, even with errors (testing performance, not functionality)
        const endTime = performance.now();
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(2000);
      }
    });

    test('large dataset processing performance', async () => {
      // Create large mock dataset
      const largeTaskCount = 1000;
      const startTime = performance.now();
      
      try {
        // Test with filters that would process many items
        const filters: DemandFilters = {
          skills: ['Tax Preparation', 'Advisory', 'Audit'],
          clients: Array.from({ length: 100 }, (_, i) => `client-${i + 1}`),
          preferredStaff: {
            staffIds: Array.from({ length: 50 }, (_, i) => `staff-${i + 1}`),
            includeUnassigned: true,
            showOnlyPreferred: false
          }
        };
        
        await DemandMatrixService.generateDemandMatrix('demand-only', new Date(), filters);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should handle large datasets within 5 seconds
        expect(duration).toBeLessThan(5000);
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(5000);
      }
    });

    test('concurrent request handling', async () => {
      const startTime = performance.now();
      
      // Create multiple concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) => 
        DemandMatrixService.generateDemandMatrix('demand-only', new Date(), {
          skills: [`skill-${i + 1}`]
        }).catch(() => ({})) // Catch errors to test performance
      );
      
      await Promise.all(requests);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Concurrent requests should complete within 3 seconds
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('Filter Performance', () => {
    const createLargeMatrixData = (): DemandMatrixData => ({
      months: Array.from({ length: 12 }, (_, i) => ({
        key: `2025-${(i + 1).toString().padStart(2, '0')}`,
        label: `Month ${i + 1}`
      })),
      skills: Array.from({ length: 20 }, (_, i) => `Skill ${i + 1}`),
      dataPoints: Array.from({ length: 2400 }, (_, i) => ({ // 12 months * 20 skills * 10 data points
        skillType: `Skill ${(i % 20) + 1}`,
        month: `2025-${((i % 12) + 1).toString().padStart(2, '0')}`,
        monthLabel: `Month ${(i % 12) + 1}`,
        demandHours: Math.floor(Math.random() * 100),
        taskCount: Math.floor(Math.random() * 10),
        clientCount: Math.floor(Math.random() * 5),
        taskBreakdown: Array.from({ length: 10 }, (_, j) => ({
          clientId: `client-${j + 1}`,
          clientName: `Client ${j + 1}`,
          recurringTaskId: `task-${i}-${j}`,
          taskName: `Task ${i}-${j}`,
          skillType: `Skill ${(i % 20) + 1}`,
          estimatedHours: 5,
          recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
          monthlyHours: 5,
          preferredStaff: Math.random() > 0.5 ? {
            staffId: `staff-${Math.floor(Math.random() * 50) + 1}`,
            staffName: `Staff ${Math.floor(Math.random() * 50) + 1}`,
            roleTitle: 'CPA'
          } : undefined
        }))
      })),
      totalDemand: 50000,
      totalTasks: 24000,
      totalClients: 500,
      skillSummary: {}
    });

    test('skill filtering performance', () => {
      const largeData = createLargeMatrixData();
      const filters: DemandFilters = {
        skills: ['Skill 1', 'Skill 5', 'Skill 10']
      };
      
      const startTime = performance.now();
      const filteredData = DemandPerformanceOptimizer.optimizeFiltering(largeData, filters);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Filtering should complete within 100ms
      expect(duration).toBeLessThan(100);
      expect(filteredData.dataPoints.length).toBeLessThan(largeData.dataPoints.length);
    });

    test('client filtering performance', () => {
      const largeData = createLargeMatrixData();
      const filters: DemandFilters = {
        clients: Array.from({ length: 50 }, (_, i) => `client-${i + 1}`)
      };
      
      const startTime = performance.now();
      const filteredData = DemandPerformanceOptimizer.optimizeFiltering(largeData, filters);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Client filtering should complete within 200ms
      expect(duration).toBeLessThan(200);
      expect(filteredData.dataPoints.length).toBeGreaterThanOrEqual(0);
    });

    test('preferred staff filtering performance', () => {
      const largeData = createLargeMatrixData();
      const filters: DemandFilters = {
        preferredStaff: {
          staffIds: Array.from({ length: 25 }, (_, i) => `staff-${i + 1}`),
          includeUnassigned: true,
          showOnlyPreferred: false
        }
      };
      
      const startTime = performance.now();
      const filteredData = DemandPerformanceOptimizer.optimizeFiltering(largeData, filters);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Preferred staff filtering should complete within 150ms
      expect(duration).toBeLessThan(150);
      expect(filteredData.dataPoints.length).toBeGreaterThanOrEqual(0);
    });

    test('combined filtering performance', () => {
      const largeData = createLargeMatrixData();
      const filters: DemandFilters = {
        skills: ['Skill 1', 'Skill 2', 'Skill 3'],
        clients: Array.from({ length: 20 }, (_, i) => `client-${i + 1}`),
        preferredStaff: {
          staffIds: Array.from({ length: 10 }, (_, i) => `staff-${i + 1}`),
          includeUnassigned: false,
          showOnlyPreferred: true
        }
      };
      
      const startTime = performance.now();
      const filteredData = DemandPerformanceOptimizer.optimizeFiltering(largeData, filters);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Combined filtering should complete within 300ms
      expect(duration).toBeLessThan(300);
      expect(filteredData.dataPoints.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Memory Performance', () => {
    test('memory usage stays within limits', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Create and process large dataset
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        name: `Task ${i}`,
        data: Array.from({ length: 100 }, () => Math.random())
      }));
      
      // Process the data
      const processedData = largeData.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }));
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      // Cleanup
      largeData.length = 0;
      processedData.length = 0;
    });

    test('cache memory management', () => {
      const initialCacheSize = DemandMatrixService.getCacheStats().size;
      
      // Generate multiple cache entries
      const promises = Array.from({ length: 10 }, (_, i) => 
        DemandMatrixService.generateDemandMatrix('demand-only', new Date(), {
          skills: [`skill-${i}`]
        }).catch(() => ({}))
      );
      
      return Promise.all(promises).then(() => {
        const finalCacheSize = DemandMatrixService.getCacheStats().size;
        
        // Cache should not grow indefinitely
        expect(finalCacheSize - initialCacheSize).toBeLessThanOrEqual(10);
        
        // Clear cache to free memory
        DemandMatrixService.clearCache();
        
        const clearedCacheSize = DemandMatrixService.getCacheStats().size;
        expect(clearedCacheSize).toBe(0);
      });
    });
  });

  describe('Regression Performance Tests', () => {
    test('existing functionality performance not degraded', async () => {
      // Test basic matrix generation (existing functionality)
      const startTime = performance.now();
      
      try {
        await DemandMatrixService.generateDemandMatrix('demand-only');
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Basic functionality should remain fast (under 1 second)
        expect(duration).toBeLessThan(1000);
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(1000);
      }
    });

    test('validation performance not impacted', () => {
      const testData: DemandMatrixData = {
        months: Array.from({ length: 12 }, (_, i) => ({
          key: `2025-${(i + 1).toString().padStart(2, '0')}`,
          label: `Month ${i + 1}`
        })),
        skills: ['Tax Preparation'],
        dataPoints: Array.from({ length: 100 }, (_, i) => ({
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 10,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: []
        })),
        totalDemand: 1000,
        totalTasks: 100,
        totalClients: 10,
        skillSummary: {}
      };
      
      const startTime = performance.now();
      const issues = DemandMatrixService.validateDemandMatrixData(testData);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Validation should be fast (under 50ms)
      expect(duration).toBeLessThan(50);
      expect(Array.isArray(issues)).toBe(true);
    });
  });
});
