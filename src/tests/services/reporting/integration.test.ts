
/**
 * Reporting Data Service Integration Tests
 */

import { reportingDataService } from '@/services/reporting/reportingDataService';

// Mock all dependencies
jest.mock('@/lib/supabaseClient');
jest.mock('@/services/errorLoggingService', () => ({
  logError: jest.fn()
}));

describe('ReportingDataService Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should maintain backward compatibility with existing interface', () => {
    expect(reportingDataService.getClientReportData).toBeDefined();
    expect(reportingDataService.getStaffLiaisonData).toBeDefined();
    expect(reportingDataService.clearCache).toBeDefined();
    expect(reportingDataService.getCacheStats).toBeDefined();
  });

  it('should handle cache operations correctly', () => {
    const stats = reportingDataService.getCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('entries');

    reportingDataService.clearCache();
    const clearedStats = reportingDataService.getCacheStats();
    expect(clearedStats.size).toBe(0);
  });
});

