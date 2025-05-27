
/**
 * Staff Liaison Data Access Tests
 */

import { StaffLiaisonDataAccess } from '@/services/reporting/staffLiaison/dataAccess';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({ data: [], error: null }))
        })),
        is: jest.fn(() => ({ data: [], error: null })),
        in: jest.fn(() => ({ data: [], error: null }))
      }))
    }))
  }
}));

describe('StaffLiaisonDataAccess', () => {
  let dataAccess: StaffLiaisonDataAccess;

  beforeEach(() => {
    dataAccess = new StaffLiaisonDataAccess();
    jest.clearAllMocks();
  });

  describe('getClientsData', () => {
    it('should fetch active clients data successfully', async () => {
      const mockClients = [
        { id: 'client-1', legal_name: 'Client A', staff_liaison_id: 'staff-1', expected_monthly_revenue: 5000, status: 'Active' },
        { id: 'client-2', legal_name: 'Client B', staff_liaison_id: null, expected_monthly_revenue: 3000, status: 'Active' }
      ];

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq.mockResolvedValue({
        data: mockClients,
        error: null
      });

      const result = await dataAccess.getClientsData();
      expect(result).toEqual(mockClients);
    });

    it('should throw error when clients fetch fails', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(dataAccess.getClientsData())
        .rejects.toThrow();
    });
  });

  describe('getStaffData', () => {
    it('should fetch active staff data successfully', async () => {
      const mockStaff = [
        { id: 'staff-1', full_name: 'John Doe' },
        { id: 'staff-2', full_name: 'Jane Smith' }
      ];

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq.mockResolvedValue({
        data: mockStaff,
        error: null
      });

      const result = await dataAccess.getStaffData();
      expect(result).toEqual(mockStaff);
    });
  });

  describe('getClientsForLiaison', () => {
    it('should fetch clients for specific liaison', async () => {
      const mockClients = [
        { id: 'client-1', legal_name: 'Client A', expected_monthly_revenue: 5000 }
      ];

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq.mockResolvedValue({
        data: mockClients,
        error: null
      });

      const result = await dataAccess.getClientsForLiaison('staff-1');
      expect(result).toEqual(mockClients);
    });

    it('should fetch unassigned clients when liaisonId is null', async () => {
      const mockClients = [
        { id: 'client-2', legal_name: 'Client B', expected_monthly_revenue: 3000 }
      ];

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().is.mockResolvedValue({
        data: mockClients,
        error: null
      });

      const result = await dataAccess.getClientsForLiaison(null);
      expect(result).toEqual(mockClients);
    });
  });

  describe('getRecurringTasksForClients', () => {
    it('should return empty array for no client IDs', async () => {
      const result = await dataAccess.getRecurringTasksForClients([]);
      expect(result).toEqual([]);
    });

    it('should fetch recurring tasks for client IDs', async () => {
      const mockTasks = [
        { id: 'task-1', client_id: 'client-1', status: 'Active' }
      ];

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().in.mockResolvedValue({
        data: mockTasks,
        error: null
      });

      const result = await dataAccess.getRecurringTasksForClients(['client-1']);
      expect(result).toEqual(mockTasks);
    });
  });
});
