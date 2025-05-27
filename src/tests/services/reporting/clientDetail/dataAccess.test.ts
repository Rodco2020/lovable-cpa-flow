
/**
 * Client Detail Data Access Tests
 */

import { ClientDetailDataAccess } from '@/services/reporting/clientDetail/dataAccess';

// Mock Supabase client
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

describe('ClientDetailDataAccess', () => {
  let dataAccess: ClientDetailDataAccess;

  beforeEach(() => {
    dataAccess = new ClientDetailDataAccess();
    jest.clearAllMocks();
  });

  describe('getClientWithLiaison', () => {
    it('should fetch client data successfully', async () => {
      const mockClient = {
        id: 'client-1',
        legal_name: 'Test Client',
        primary_contact: 'John Doe',
        email: 'john@test.com'
      };

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().single.mockResolvedValue({
        data: mockClient,
        error: null
      });

      const result = await dataAccess.getClientWithLiaison('client-1');
      expect(result).toEqual(mockClient);
    });

    it('should throw error when client not found', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      });

      await expect(dataAccess.getClientWithLiaison('client-1'))
        .rejects.toThrow('Client not found');
    });
  });

  describe('getStaffLiaisonName', () => {
    it('should return undefined for null staff liaison id', async () => {
      const result = await dataAccess.getStaffLiaisonName(null);
      expect(result).toBeUndefined();
    });

    it('should fetch staff liaison name', async () => {
      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().eq().single.mockResolvedValue({
        data: { full_name: 'Jane Smith' },
        error: null
      });

      const result = await dataAccess.getStaffLiaisonName('staff-1');
      expect(result).toBe('Jane Smith');
    });
  });

  describe('getStaffMap', () => {
    it('should return empty map for no staff assignments', async () => {
      const result = await dataAccess.getStaffMap([]);
      expect(result).toEqual(new Map());
    });

    it('should create staff name mapping', async () => {
      const mockTaskInstances = [
        { assigned_staff_id: 'staff-1' },
        { assigned_staff_id: 'staff-2' },
        { assigned_staff_id: null }
      ];

      const { supabase } = require('@/lib/supabaseClient');
      supabase.from().select().in.mockResolvedValue({
        data: [
          { id: 'staff-1', full_name: 'John Doe' },
          { id: 'staff-2', full_name: 'Jane Smith' }
        ],
        error: null
      });

      const result = await dataAccess.getStaffMap(mockTaskInstances);
      expect(result.get('staff-1')).toBe('John Doe');
      expect(result.get('staff-2')).toBe('Jane Smith');
      expect(result.size).toBe(2);
    });
  });
});
