
/**
 * Client Detail Report Service Integration Tests
 */

import { ClientDetailReportService } from '@/services/reporting/clientDetail/clientDetailReportService';
import { ClientReportFilters } from '@/types/clientReporting';

// Mock all dependencies
jest.mock('@/lib/supabaseClient');

describe('ClientDetailReportService Integration', () => {
  let service: ClientDetailReportService;
  
  const mockFilters: ClientReportFilters = {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    },
    taskTypes: [],
    status: [],
    categories: [],
    includeCompleted: true
  };

  beforeEach(() => {
    service = new ClientDetailReportService();
    jest.clearAllMocks();
  });

  describe('getClientDetailReport', () => {
    it('should maintain API compatibility', async () => {
      // Mock the data access methods
      const mockClient = {
        id: 'client-1',
        legal_name: 'Test Client',
        primary_contact: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        industry: 'Technology',
        status: 'Active',
        expected_monthly_revenue: 5000,
        staff_liaison_id: 'staff-1'
      };

      // Mock Supabase responses
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockClient, error: null })),
            order: jest.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          in: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }));

      const result = await service.getClientDetailReport('client-1', mockFilters);

      expect(result).toHaveProperty('client');
      expect(result).toHaveProperty('taskMetrics');
      expect(result).toHaveProperty('revenueMetrics');
      expect(result).toHaveProperty('taskBreakdown');
      expect(result).toHaveProperty('timeline');
      expect(result.client.id).toBe('client-1');
    });
  });

  describe('getClientsList', () => {
    it('should return formatted clients list', async () => {
      const mockClients = [
        { id: 'client-1', legal_name: 'Client A' },
        { id: 'client-2', legal_name: 'Client B' }
      ];

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockClients, error: null }))
          }))
        }))
      }));

      const result = await service.getClientsList();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'client-1', legalName: 'Client A' });
      expect(result[1]).toEqual({ id: 'client-2', legalName: 'Client B' });
    });
  });
});
