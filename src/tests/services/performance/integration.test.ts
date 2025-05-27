
/**
 * Performance Monitoring Integration Tests
 * 
 * Tests the complete performance monitoring system
 */

import { PerformanceMonitoringService } from '@/services/performance';

describe('PerformanceMonitoringService Integration', () => {
  let service: PerformanceMonitoringService;

  beforeEach(() => {
    service = new PerformanceMonitoringService({
      maxMetrics: 10,
      slowThreshold: 100,
      warningThreshold: 50
    });
  });

  it('should handle complete timing workflow', async () => {
    // Test async timing
    const result = await service.timeAsync(
      'test-operation',
      'TestComponent',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'success';
      }
    );

    expect(result).toBe('success');

    // Test sync timing
    const syncResult = service.timeSync(
      'sync-operation',
      'TestComponent',
      () => 'sync-success'
    );

    expect(syncResult).toBe('sync-success');

    // Generate report
    const report = service.generateReport();
    expect(report.summary.totalOperations).toBe(2);
    expect(report.summary.averageResponseTime).toBeGreaterThan(0);
  });

  it('should handle manual timing', () => {
    const timingId = service.startTiming('manual-test', 'TestComponent');
    const metric = service.endTiming(timingId);

    expect(metric).toBeDefined();
    expect(metric?.name).toBe('manual-test');
    expect(metric?.component).toBe('TestComponent');

    const componentMetrics = service.getComponentMetrics('TestComponent');
    expect(componentMetrics).toHaveLength(1);
  });

  it('should handle slow operation alerts', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    // This should trigger a slow operation alert
    service.timeSync(
      'slow-operation',
      'TestComponent',
      () => {
        // Simulate slow operation by direct metric recording
        const slowMetric = {
          id: 'slow-1',
          name: 'slow-operation',
          duration: 150, // Above threshold
          timestamp: new Date(),
          component: 'TestComponent'
        };
        service.recordMetric(slowMetric);
        return 'done';
      }
    );

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should export metrics correctly', () => {
    service.timeSync('export-test', 'TestComponent', () => 'test');

    const jsonExport = service.exportMetrics('json');
    expect(jsonExport).toContain('export-test');

    const csvExport = service.exportMetrics('csv');
    expect(csvExport).toContain('timestamp,component,name,duration,metadata');
  });

  it('should clear old metrics', () => {
    service.timeSync('old-metric', 'TestComponent', () => 'test');
    
    const clearedCount = service.clearMetrics(0); // Clear all
    expect(clearedCount).toBe(1);

    const report = service.generateReport();
    expect(report.summary.totalOperations).toBe(0);
  });
});
