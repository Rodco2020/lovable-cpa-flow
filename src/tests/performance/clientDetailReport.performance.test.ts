
/**
 * Performance Tests for Client Detail Report
 * 
 * Tests performance with realistic data volumes and scenarios
 */

import { performance } from 'perf_hooks';
import { ClientDetailReportService } from '@/services/reporting/clientDetail/clientDetailReportService';
import { ClientReportFilters } from '@/types/clientReporting';

// Mock large dataset
const generateMockClients = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `client-${i}`,
    legal_name: `Client ${i}`,
    primary_contact: `Contact ${i}`,
    email: `client${i}@example.com`,
    phone: `555-${String(i).padStart(4, '0')}`,
    industry: ['Technology', 'Healthcare', 'Finance', 'Manufacturing'][i % 4],
    status: 'Active',
    expected_monthly_revenue: 1000 + (i * 100),
    staff_liaison_id: `staff-${i % 10}`
  }));
};

const generateMockTasks = (clientId: string, taskCount: number) => {
  const recurringTasks = Array.from({ length: Math.floor(taskCount / 2) }, (_, i) => ({
    id: `recurring-${clientId}-${i}`,
    name: `Recurring Task ${i}`,
    category: ['Tax', 'Advisory', 'Audit', 'Review'][i % 4],
    status: ['Active', 'Completed', 'Paused'][i % 3],
    priority: ['High', 'Medium', 'Low'][i % 3],
    estimated_hours: 2 + (i % 8),
    due_date: new Date(Date.now() + (i * 86400000)).toISOString(),
    notes: `Notes for recurring task ${i}`
  }));

  const taskInstances = Array.from({ length: Math.floor(taskCount / 2) }, (_, i) => ({
    id: `instance-${clientId}-${i}`,
    name: `Task Instance ${i}`,
    category: ['Tax', 'Advisory', 'Audit', 'Review'][i % 4],
    status: ['Scheduled', 'In Progress', 'Completed'][i % 3],
    priority: ['High', 'Medium', 'Low'][i % 3],
    estimated_hours: 1 + (i % 6),
    due_date: new Date(Date.now() + (i * 86400000)).toISOString(),
    completed_at: i % 3 === 2 ? new Date().toISOString() : null,
    assigned_staff_id: `staff-${i % 5}`,
    notes: `Notes for task instance ${i}`
  }));

  return { recurringTasks, taskInstances };
};

// Mock Supabase for performance testing
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

describe('Client Detail Report - Performance Tests', () => {
  let service: ClientDetailReportService;
  const defaultFilters: ClientReportFilters = {
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

  describe('Large Dataset Performance', () => {
    it('should handle 100 clients list retrieval within acceptable time', async () => {
      const mockClients = generateMockClients(100);
      
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().order.mockResolvedValue({
        data: mockClients,
        error: null
      });

      const startTime = performance.now();
      const result = await service.getClientsList();
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      
      expect(result).toHaveLength(100);
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle client with 50 tasks efficiently', async () => {
      const clientId = 'test-client';
      const mockClient = generateMockClients(1)[0];
      const { recurringTasks, taskInstances } = generateMockTasks(clientId, 50);

      const { supabase } = require('@/lib/supabaseClient');
      
      // Mock client data
      supabase.from().select().eq().single.mockResolvedValue({
        data: mockClient,
        error: null
      });

      // Mock tasks data
      supabase.from().select().eq.mockImplementation((table: string) => {
        if (table === 'recurring_tasks') {
          return Promise.resolve({ data: recurringTasks, error: null });
        }
        if (table === 'task_instances') {
          return Promise.resolve({ data: taskInstances, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const startTime = performance.now();
      const result = await service.getClientDetailReport(clientId, defaultFilters);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      expect(result.taskMetrics.totalTasks).toBe(50);
      expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle concurrent report generation', async () => {
      const mockClients = generateMockClients(5);
      const clientIds = mockClients.map(c => c.id);

      const { supabase } = require('@/lib/supabaseClient');
      
      // Mock responses for all clients
      supabase.from().select().eq().single.mockImplementation((clientId: string) => {
        const client = mockClients.find(c => c.id === clientId);
        return Promise.resolve({ data: client, error: null });
      });

      supabase.from().select().eq.mockResolvedValue({ data: [], error: null });

      const startTime = performance.now();
      
      // Generate reports concurrently
      const promises = clientIds.map(clientId => 
        service.getClientDetailReport(clientId, defaultFilters)
      );
      
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      expect(results).toHaveLength(5);
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not cause memory leaks with repeated operations', async () => {
      const mockClient = generateMockClients(1)[0];
      const { supabase } = require('@/lib/supabaseClient');
      
      supabase.from().select().eq().single.mockResolvedValue({
        data: mockClient,
        error: null
      });
      supabase.from().select().eq.mockResolvedValue({ data: [], error: null });

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform multiple operations
      for (let i = 0; i < 50; i++) {
        await service.getClientDetailReport('test-client', defaultFilters);
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Error Recovery Performance', () => {
    it('should handle errors quickly without hanging', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().single.mockRejectedValue(new Error('Database error'));

      const startTime = performance.now();
      
      try {
        await service.getClientDetailReport('invalid-client', defaultFilters);
      } catch (error) {
        // Expected to throw
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(1000); // Should fail quickly
    });
  });
});
