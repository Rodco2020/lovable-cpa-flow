
import { PreferredStaffFilterStrategy } from '../preferredStaffFilterStrategy';
import { DemandMatrixData, DemandFilters } from '@/types/demand';

// Mock the staff ID utilities
jest.mock('@/utils/staffIdUtils', () => ({
  normalizeStaffId: jest.fn((id) => id ? String(id).toLowerCase() : undefined),
  isStaffIdInArray: jest.fn((targetId, array) => {
    const normalized = targetId ? String(targetId).toLowerCase() : undefined;
    return normalized && array.some((id: any) => id && String(id).toLowerCase() === normalized);
  }),
  findStaffIdMatches: jest.fn((array1, array2) => ({
    matches: ['staff-1'],
    onlyInArray1: [],
    onlyInArray2: [],
    totalMatches: 1
  }))
}));

describe('PreferredStaffFilterStrategy', () => {
  let strategy: PreferredStaffFilterStrategy;
  let mockData: DemandMatrixData;
  let mockFilters: DemandFilters;

  beforeEach(() => {
    strategy = new PreferredStaffFilterStrategy();
    
    mockData = {
      dataPoints: [
        {
          month: '2024-01',
          monthLabel: 'Jan 2024',
          skillType: 'Junior',
          demandHours: 40,
          taskCount: 2,
          clientCount: 1,
          taskBreakdown: [
            {
              recurringTaskId: 'task-1',
              taskName: 'Test Task 1',
              clientId: 'client-1',
              clientName: 'Test Client',
              skillType: 'Junior',
              estimatedHours: 20,
              recurrencePattern: { type: 'monthly', interval: 1, frequency: 12 },
              monthlyHours: 20,
              preferredStaffId: 'staff-1',
              preferredStaffName: 'John Doe'
            },
            {
              recurringTaskId: 'task-2',
              taskName: 'Test Task 2',
              clientId: 'client-1',
              clientName: 'Test Client',
              skillType: 'Junior',
              estimatedHours: 20,
              recurrencePattern: { type: 'monthly', interval: 1, frequency: 12 },
              monthlyHours: 20,
              preferredStaffId: 'staff-2',
              preferredStaffName: 'Jane Smith'
            }
          ]
        }
      ],
      months: [{ key: '2024-01', label: 'Jan 2024' }],
      skills: ['Junior'],
      totalDemand: 40,
      totalTasks: 2,
      totalClients: 1,
      skillSummary: {
        'Junior': {
          totalHours: 40,
          taskCount: 2,
          clientCount: 1
        }
      }
    };

    mockFilters = {
      skills: [],
      clients: [],
      preferredStaff: ['staff-1'],
      timeHorizon: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      }
    };

    // Clear all mocks
    jest.clearAllMocks();
    
    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getName', () => {
    it('should return the correct strategy name', () => {
      expect(strategy.getName()).toBe('PreferredStaffFilter');
    });
  });

  describe('getPriority', () => {
    it('should return priority 4', () => {
      expect(strategy.getPriority()).toBe(4);
    });
  });

  describe('shouldApply', () => {
    it('should return true when preferred staff filter is provided', () => {
      expect(strategy.shouldApply(mockFilters)).toBe(true);
    });

    it('should return false when preferred staff filter is empty', () => {
      const emptyFilters = { ...mockFilters, preferredStaff: [] };
      expect(strategy.shouldApply(emptyFilters)).toBe(false);
    });

    it('should return false when preferred staff filter is not provided', () => {
      const noStaffFilters = { ...mockFilters, preferredStaff: undefined as any };
      expect(strategy.shouldApply(noStaffFilters)).toBe(false);
    });
  });

  describe('apply', () => {
    it('should return original data when no preferred staff filter is provided', () => {
      const noStaffFilters = { ...mockFilters, preferredStaff: [] };
      const result = strategy.apply(mockData, noStaffFilters);
      
      expect(result).toEqual(mockData);
    });

    it('should filter data points based on preferred staff', () => {
      const result = strategy.apply(mockData, mockFilters);
      
      expect(result.dataPoints).toHaveLength(1);
      expect(result.dataPoints[0].taskBreakdown).toHaveLength(1);
      expect(result.dataPoints[0].taskBreakdown![0].preferredStaffId).toBe('staff-1');
    });

    it('should recalculate totals after filtering', () => {
      const result = strategy.apply(mockData, mockFilters);
      
      expect(result.totalDemand).toBe(20); // Only one task with 20 hours
      expect(result.totalTasks).toBe(1);
      expect(result.totalClients).toBe(1);
    });

    it('should update skill summary after filtering', () => {
      const result = strategy.apply(mockData, mockFilters);
      
      expect(result.skillSummary['Junior'].totalHours).toBe(20);
      expect(result.skillSummary['Junior'].taskCount).toBe(1);
    });

    it('should handle empty results when no tasks match', () => {
      const noMatchFilters = { ...mockFilters, preferredStaff: ['non-existent-staff'] };
      const result = strategy.apply(mockData, noMatchFilters);
      
      expect(result.dataPoints).toHaveLength(0);
      expect(result.totalDemand).toBe(0);
      expect(result.totalTasks).toBe(0);
    });

    it('should handle data points without task breakdown', () => {
      const dataWithoutBreakdown = {
        ...mockData,
        dataPoints: [
          {
            month: '2024-01',
            monthLabel: 'Jan 2024',
            skillType: 'Junior',
            demandHours: 40,
            taskCount: 0,
            clientCount: 0
          }
        ]
      };

      const result = strategy.apply(dataWithoutBreakdown, mockFilters);
      
      expect(result.dataPoints).toHaveLength(0);
    });
  });
});
