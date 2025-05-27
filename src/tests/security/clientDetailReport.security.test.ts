
/**
 * Security Tests for Client Detail Report
 * 
 * Tests security considerations and data validation
 */

import { ClientDetailReportService } from '@/services/reporting/clientDetail/clientDetailReportService';
import { ClientReportFilters } from '@/types/clientReporting';

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({ data: [], error: null }))
        })),
        in: jest.fn(() => ({ data: [], error: null }))
      }))
    }))
  }
}));

describe('Client Detail Report - Security Tests', () => {
  let service: ClientDetailReportService;

  beforeEach(() => {
    service = new ClientDetailReportService();
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should reject invalid client IDs', async () => {
      const invalidIds = [
        '', // Empty string
        '   ', // Whitespace only
        'invalid-id-with-special-chars-!@#$%',
        'a'.repeat(1000), // Extremely long ID
        null as any,
        undefined as any,
        {} as any,
        [] as any
      ];

      const defaultFilters: ClientReportFilters = {
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-12-31') },
        taskTypes: [],
        status: [],
        categories: [],
        includeCompleted: true
      };

      for (const invalidId of invalidIds) {
        await expect(service.getClientDetailReport(invalidId, defaultFilters))
          .rejects.toThrow();
      }
    });

    it('should validate filter parameters', async () => {
      const validClientId = 'valid-client-id';
      
      const invalidFilters = [
        null as any,
        undefined as any,
        {} as any, // Missing required fields
        {
          dateRange: null,
          taskTypes: [],
          status: [],
          categories: [],
          includeCompleted: true
        } as any
      ];

      for (const invalidFilter of invalidFilters) {
        await expect(service.getClientDetailReport(validClientId, invalidFilter))
          .rejects.toThrow();
      }
    });

    it('should validate date ranges', async () => {
      const validClientId = 'valid-client-id';
      
      const invalidDateFilters: ClientReportFilters[] = [
        {
          dateRange: {
            from: new Date('2024-12-31'), // From after To
            to: new Date('2024-01-01')
          },
          taskTypes: [],
          status: [],
          categories: [],
          includeCompleted: true
        },
        {
          dateRange: {
            from: new Date('invalid-date') as any,
            to: new Date('2024-12-31')
          },
          taskTypes: [],
          status: [],
          categories: [],
          includeCompleted: true
        }
      ];

      for (const invalidFilter of invalidDateFilters) {
        await expect(service.getClientDetailReport(validClientId, invalidFilter))
          .rejects.toThrow();
      }
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize client data in report output', async () => {
      const maliciousClient = {
        id: 'client-1',
        legal_name: '<script>alert("xss")</script>Acme Corp',
        primary_contact: 'John<script>alert("xss")</script>Smith',
        email: 'test@example.com',
        phone: '555-0123',
        industry: 'Technology',
        status: 'Active',
        expected_monthly_revenue: 5000
      };

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().single.mockResolvedValue({
        data: maliciousClient,
        error: null
      });
      supabase.from().select().eq.mockResolvedValue({ data: [], error: null });

      const filters: ClientReportFilters = {
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-12-31') },
        taskTypes: [],
        status: [],
        categories: [],
        includeCompleted: true
      };

      const result = await service.getClientDetailReport('client-1', filters);

      // Check that potentially malicious content is handled appropriately
      expect(result.client.legalName).not.toContain('<script>');
      expect(result.client.primaryContact).not.toContain('<script>');
    });

    it('should handle SQL injection attempts in filters', async () => {
      const validClientId = 'valid-client-id';
      
      const maliciousFilters: ClientReportFilters = {
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-12-31') },
        taskTypes: ["'; DROP TABLE clients; --"] as any,
        status: ["1' OR '1'='1"] as any,
        categories: ["UNION SELECT * FROM auth.users"] as any,
        includeCompleted: true
      };

      // Service should handle this gracefully without breaking
      await expect(service.getClientDetailReport(validClientId, maliciousFilters))
        .resolves.toBeDefined();
    });
  });

  describe('Access Control', () => {
    it('should not expose sensitive database errors', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().single.mockRejectedValue(
        new Error('relation "clients" does not exist')
      );

      const filters: ClientReportFilters = {
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-12-31') },
        taskTypes: [],
        status: [],
        categories: [],
        includeCompleted: true
      };

      await expect(service.getClientDetailReport('client-1', filters))
        .rejects.toThrow();

      // The error should not expose internal database details
      try {
        await service.getClientDetailReport('client-1', filters);
      } catch (error: any) {
        expect(error.message).not.toContain('relation');
        expect(error.message).not.toContain('does not exist');
      }
    });

    it('should handle unauthorized access attempts', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().single.mockRejectedValue(
        new Error('insufficient privileges')
      );

      const filters: ClientReportFilters = {
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-12-31') },
        taskTypes: [],
        status: [],
        categories: [],
        includeCompleted: true
      };

      await expect(service.getClientDetailReport('restricted-client', filters))
        .rejects.toThrow();
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    it('should handle rapid successive requests gracefully', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().single.mockResolvedValue({
        data: { id: 'client-1', legal_name: 'Test Client' },
        error: null
      });
      supabase.from().select().eq.mockResolvedValue({ data: [], error: null });

      const filters: ClientReportFilters = {
        dateRange: { from: new Date('2024-01-01'), to: new Date('2024-12-31') },
        taskTypes: [],
        status: [],
        categories: [],
        includeCompleted: true
      };

      // Simulate rapid requests
      const promises = Array.from({ length: 20 }, () => 
        service.getClientDetailReport('client-1', filters)
      );

      // Should not crash or hang
      const results = await Promise.allSettled(promises);
      expect(results.every(r => r.status === 'fulfilled')).toBe(true);
    });

    it('should handle extremely large date ranges', async () => {
      const filters: ClientReportFilters = {
        dateRange: { 
          from: new Date('1900-01-01'), // 124 years ago
          to: new Date('2100-12-31')   // 76 years in future
        },
        taskTypes: [],
        status: [],
        categories: [],
        includeCompleted: true
      };

      // Should handle or reject appropriately without crashing
      await expect(service.getClientDetailReport('client-1', filters))
        .resolves.toBeDefined();
    });
  });
});
