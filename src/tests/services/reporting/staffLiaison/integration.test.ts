
/**
 * Staff Liaison Report Service Integration Tests
 */

import { StaffLiaisonReportService } from '@/services/reporting/staffLiaison/staffLiaisonReportService';
import { ReportFilters } from '@/types/reporting';

// Mock all dependencies
jest.mock('@/lib/supabaseClient');

describe('StaffLiaisonReportService Integration', () => {
  let service: StaffLiaisonReportService;
  
  const mockFilters: ReportFilters = {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    },
    taskTypes: [],
    status: [],
    staffLiaisonIds: []
  };

  beforeEach(() => {
    service = new StaffLiaisonReportService();
    jest.clearAllMocks();
  });

  describe('getStaffLiaisonReportData', () => {
    it('should maintain API compatibility', async () => {
      // Mock Supabase responses
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }));

      const result = await service.getStaffLiaisonReportData(mockFilters);

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('availableStaff');
      expect(result).toHaveProperty('totalRevenue');
      expect(result).toHaveProperty('totalClients');
      expect(result).toHaveProperty('totalTasks');
    });
  });

  describe('getClientTasksByLiaison', () => {
    it('should return empty array for no clients', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          is: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }));

      const result = await service.getClientTasksByLiaison('staff-1', mockFilters);
      expect(result).toEqual([]);
    });

    it('should handle unassigned liaison (null)', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          is: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }));

      const result = await service.getClientTasksByLiaison(null, mockFilters);
      expect(result).toEqual([]);
    });
  });
});
