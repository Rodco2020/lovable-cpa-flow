
/**
 * Revenue Data Access Tests
 */

import { RevenueDataAccess } from '@/services/revenue/dataAccess';

// Mock Supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-id', legal_name: 'Test Client', expected_monthly_revenue: 5000 }, 
            error: null 
          }))
        }))
      }))
    }))
  }
}));

describe('RevenueDataAccess', () => {
  let dataAccess: RevenueDataAccess;

  beforeEach(() => {
    dataAccess = new RevenueDataAccess();
    jest.clearAllMocks();
  });

  it('should get client data', async () => {
    const client = await dataAccess.getClient('test-id');
    
    expect(client).toBeDefined();
    expect(client?.id).toBe('test-id');
    expect(client?.legal_name).toBe('Test Client');
  });

  it('should get skill rates as a map', async () => {
    const { supabase } = require('@/lib/supabaseClient');
    supabase.from.mockReturnValue({
      select: jest.fn(() => Promise.resolve({
        data: [{ name: 'accounting', cost_per_hour: 200 }],
        error: null
      }))
    });

    const skillRates = await dataAccess.getSkillRates();
    
    expect(skillRates).toBeInstanceOf(Map);
    expect(skillRates.get('accounting')).toBe(200);
  });
});
