
/**
 * Performance Timing Manager Tests
 */

import { PerformanceTimingManager } from '@/services/performance/timing';

describe('PerformanceTimingManager', () => {
  let timingManager: PerformanceTimingManager;

  beforeEach(() => {
    timingManager = new PerformanceTimingManager();
  });

  it('should start and end timing correctly', () => {
    const timingId = timingManager.startTiming('test-operation', 'TestComponent');
    expect(timingId).toBeDefined();
    expect(typeof timingId).toBe('string');
    
    // Wait a small amount of time
    const metric = timingManager.endTiming(timingId);
    
    expect(metric).toBeDefined();
    expect(metric?.name).toBe('test-operation');
    expect(metric?.component).toBe('TestComponent');
    expect(metric?.duration).toBeGreaterThan(0);
  });

  it('should handle invalid timing ids', () => {
    const metric = timingManager.endTiming('invalid-id');
    expect(metric).toBeNull();
  });

  it('should time async operations', async () => {
    const asyncOperation = () => new Promise(resolve => setTimeout(resolve, 10));
    
    const { result, metric } = await timingManager.timeAsync(
      'async-test',
      'TestComponent',
      asyncOperation
    );
    
    expect(result).toBeUndefined();
    expect(metric).toBeDefined();
    expect(metric?.duration).toBeGreaterThan(0);
  });

  it('should time sync operations', () => {
    const syncOperation = () => 'test-result';
    
    const { result, metric } = timingManager.timeSync(
      'sync-test',
      'TestComponent',
      syncOperation
    );
    
    expect(result).toBe('test-result');
    expect(metric).toBeDefined();
    expect(metric?.duration).toBeGreaterThan(0);
  });

  it('should handle async operation errors', async () => {
    const errorOperation = () => Promise.reject(new Error('Test error'));
    
    await expect(
      timingManager.timeAsync('error-test', 'TestComponent', errorOperation)
    ).rejects.toThrow('Test error');
  });

  it('should clear timing data', () => {
    timingManager.startTiming('test', 'component');
    expect(timingManager.getActiveTimingCount()).toBe(1);
    
    timingManager.clearTimingData();
    expect(timingManager.getActiveTimingCount()).toBe(0);
  });
});
