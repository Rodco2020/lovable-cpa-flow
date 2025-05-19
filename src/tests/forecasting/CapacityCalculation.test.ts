import { generateForecast, clearForecastCache } from '@/services/forecastingService';
import { getAllStaff, getWeeklyAvailabilityByStaff } from '@/services/staffService';
import { getRecurringTasks } from '@/services/taskService';
import { Staff, WeeklyAvailability } from '@/types/staff';
import { ForecastParameters } from '@/types/forecasting';

jest.mock('@/services/staffService');
jest.mock('@/services/taskService');

const mockedGetAllStaff = getAllStaff as jest.Mock;
const mockedGetWeeklyAvailability = getWeeklyAvailabilityByStaff as jest.Mock;
const mockedGetRecurringTasks = getRecurringTasks as jest.Mock;

describe('generateForecast capacity calculation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearForecastCache();
  });

  it('clips period ranges to the forecast date range', async () => {
    const staffMembers: Staff[] = [
      {
        id: 's1',
        fullName: 'Staff 1',
        roleTitle: '',
        skills: ['CPA'],
        costPerHour: 0,
        email: '',
        phone: '',
        status: 'active',
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 's2',
        fullName: 'Staff 2',
        roleTitle: '',
        skills: ['CPA'],
        costPerHour: 0,
        email: '',
        phone: '',
        status: 'active',
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 's3',
        fullName: 'Staff 3',
        roleTitle: '',
        skills: ['CPA'],
        costPerHour: 0,
        email: '',
        phone: '',
        status: 'active',
        createdAt: '',
        updatedAt: ''
      }
    ];

    const availability: WeeklyAvailability[] = [1,2,3,4,5].map(day => ({
      staffId: 's1',
      dayOfWeek: day as 0|1|2|3|4|5|6,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    }));

    mockedGetAllStaff.mockResolvedValue(staffMembers);
    mockedGetWeeklyAvailability.mockResolvedValue(availability);
    mockedGetRecurringTasks.mockResolvedValue([]);

    const startDate = new Date('2023-06-01T00:00:00Z');
    const endDate = new Date('2023-06-30T23:59:59Z');

    const params: ForecastParameters = {
      mode: 'virtual',
      timeframe: 'custom',
      dateRange: { startDate, endDate },
      granularity: 'weekly',
      includeSkills: 'all',
      skillAllocationStrategy: 'distribute'
    };

    const result = await generateForecast(params);

    const weeks = (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
    const expected = 40 * weeks * staffMembers.length;

    expect(Math.round(result.summary.totalCapacity)).toBeCloseTo(expected, 1);
  });
});
