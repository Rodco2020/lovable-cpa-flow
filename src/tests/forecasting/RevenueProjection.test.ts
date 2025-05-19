import { generateForecast, clearForecastCache } from '@/services/forecastingService';
import { getAllStaff, getWeeklyAvailabilityByStaff } from '@/services/staffService';
import { getRecurringTasks, getTaskInstances } from '@/services/taskService';
import { getActiveClients } from '@/services/clientService';
import { ForecastParameters } from '@/types/forecasting';
import { Staff, WeeklyAvailability } from '@/types/staff';
import { Client } from '@/types/client';

jest.mock('@/services/staffService');
jest.mock('@/services/taskService');
jest.mock('@/services/clientService');

const mockedGetAllStaff = getAllStaff as jest.Mock;
const mockedGetWeeklyAvailability = getWeeklyAvailabilityByStaff as jest.Mock;
const mockedGetRecurringTasks = getRecurringTasks as jest.Mock;
const mockedGetTaskInstances = getTaskInstances as jest.Mock;
const mockedGetActiveClients = getActiveClients as jest.Mock;

const activeClients: Client[] = [
  {
    id: 'c1',
    legalName: 'Client 1',
    primaryContact: '',
    email: '',
    phone: '',
    billingAddress: '',
    industry: 'Other',
    status: 'Active',
    expectedMonthlyRevenue: 1000,
    paymentTerms: 'Net30',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'Medium',
    notificationPreferences: { emailReminders: true, taskNotifications: true },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'c2',
    legalName: 'Client 2',
    primaryContact: '',
    email: '',
    phone: '',
    billingAddress: '',
    industry: 'Other',
    status: 'Active',
    expectedMonthlyRevenue: 2000,
    paymentTerms: 'Net30',
    billingFrequency: 'Monthly',
    defaultTaskPriority: 'Medium',
    notificationPreferences: { emailReminders: true, taskNotifications: true },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

beforeEach(() => {
  jest.clearAllMocks();
  clearForecastCache();
  mockedGetRecurringTasks.mockResolvedValue([]);
  mockedGetTaskInstances.mockResolvedValue([]);
  mockedGetAllStaff.mockResolvedValue([] as Staff[]);
  mockedGetWeeklyAvailability.mockResolvedValue([] as WeeklyAvailability[]);
  mockedGetActiveClients.mockResolvedValue(activeClients);
});

describe('generateForecast revenue projections', () => {
  it('calculates revenue for a 30-day period', async () => {
    const params: ForecastParameters = {
      mode: 'virtual',
      timeframe: 'custom',
      dateRange: {
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-06-30T23:59:59')
      },
      granularity: 'monthly',
      includeSkills: 'all',
      skillAllocationStrategy: 'distribute'
    };

    const result = await generateForecast(params);

    expect(result.financials[0].revenue).toBeCloseTo(3000, 2);
  });

  it('calculates revenue for a 90-day period', async () => {
    const params: ForecastParameters = {
      mode: 'virtual',
      timeframe: 'custom',
      dateRange: {
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-08-29T23:59:59')
      },
      granularity: 'monthly',
      includeSkills: 'all',
      skillAllocationStrategy: 'distribute'
    };

    const result = await generateForecast(params);

    const expected = 3000 * (1 + 31/30 + 31/30);
    expect(result.summary.totalRevenue).toBeCloseTo(expected, 2);
  });
});
