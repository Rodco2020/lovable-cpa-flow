
/**
 * Revenue Service Integration Tests
 */

import { RevenueService } from '@/services/revenue/revenueService';

// Mock all dependencies
jest.mock('@/lib/supabaseClient');
jest.mock('@/services/errorLoggingService', () => ({
  logError: jest.fn()
}));

describe('RevenueService Integration', () => {
  let service: RevenueService;

  beforeEach(() => {
    service = new RevenueService();
    jest.clearAllMocks();
  });

  it('should maintain backward compatibility', () => {
    expect(service.calculateClientRevenue).toBeDefined();
    expect(service.calculateTaskRevenue).toBeDefined();
    expect(service.calculateRevenueProjections).toBeDefined();
    expect(service.validateRevenueData).toBeDefined();
    expect(service.clearCache).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // Mock data access to throw error
    jest.spyOn(service['dataAccess'], 'getClient').mockRejectedValue(new Error('Test error'));

    await expect(service.calculateClientRevenue('invalid-id')).rejects.toThrow('Test error');
  });
});
