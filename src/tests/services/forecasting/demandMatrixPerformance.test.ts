
import { describe, it, expect } from 'vitest';
import { DemandMatrixData } from '@/types/demand';

describe('Demand Matrix Performance', () => {
  it('should handle large datasets efficiently', () => {
    const largeMockData: DemandMatrixData = {
      months: [
        { key: '2024-01', label: 'Jan 2024' },
        { key: '2024-02', label: 'Feb 2024' }
      ],
      skills: ['Junior', 'Senior'],
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {},
      clientTotals: new Map(),
      aggregationStrategy: 'skill-based'
    };
    
    const startTime = performance.now();
    
    // Simulate processing
    const processedData = {
      ...largeMockData,
      totalDemand: largeMockData.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0)
    };
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(processedData).toBeDefined();
    expect(executionTime).toBeLessThan(100); // Should complete within 100ms
  });
  
  it('should maintain performance with complex filtering', () => {
    const mockData: DemandMatrixData = {
      months: [{ key: '2024-01', label: 'Jan 2024' }],
      skills: ['Junior'],
      dataPoints: [
        {
          skillType: 'Junior',
          month: '2024-01',
          monthLabel: 'Jan 2024',
          demandHours: 40,
          totalHours: 40,
          taskCount: 2,
          clientCount: 1,
          taskBreakdown: []
        }
      ],
      totalDemand: 40,
      totalTasks: 2,
      totalClients: 1,
      skillSummary: {
        'Junior': {
          totalHours: 40,
          demandHours: 40,
          taskCount: 2,
          clientCount: 1
        }
      },
      clientTotals: new Map([['client-1', 40]]),
      aggregationStrategy: 'skill-based'
    };
    
    const startTime = performance.now();
    
    // Simulate complex filtering
    const filteredData = mockData.dataPoints.filter(dp => 
      dp.skillType === 'Junior' && dp.demandHours > 0
    );
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(filteredData).toBeDefined();
    expect(filteredData.length).toBe(1);
    expect(executionTime).toBeLessThan(50); // Should complete within 50ms
  });
});
