
import { generateForecast, clearForecastCache } from '@/services/forecastingService';
import { getAllStaff, getWeeklyAvailabilityByStaff } from '@/services/staffService';
import { getTaskInstances } from '@/services/taskService';
import { getClientById } from '@/services/clientService';
import { Staff, StaffStatus, WeeklyAvailability } from '@/types/staff';
import { TaskInstance } from '@/types/task';
import { ForecastParameters } from '@/types/forecasting';

jest.mock('@/services/staffService');
jest.mock('@/services/taskService');
jest.mock('@/services/clientService');

const mockedGetAllStaff = getAllStaff as jest.Mock;
const mockedGetWeeklyAvailability = getWeeklyAvailabilityByStaff as jest.Mock;
const mockedGetTaskInstances = getTaskInstances as jest.Mock;
const mockedGetClientById = getClientById as jest.Mock;

describe('generateForecast cost calculation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearForecastCache();
  });

  it('calculates costs using average skill cost', async () => {
    const now = new Date('2023-01-01T00:00:00Z');
    const staffMembers: Staff[] = [
      {
        id: 's1',
        fullName: 'Staff 1',
        roleTitle: '',
        skills: ['CPA'],
        assignedSkills: ['CPA'],
        costPerHour: 30,
        email: '',
        phone: '',
        status: 'active' as StaffStatus,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 's2',
        fullName: 'Staff 2',
        roleTitle: '',
        skills: ['CPA'],
        assignedSkills: ['CPA'],
        costPerHour: 50,
        email: '',
        phone: '',
        status: 'active' as StaffStatus,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 's3',
        fullName: 'Staff 3',
        roleTitle: '',
        skills: ['CPA'],
        assignedSkills: ['CPA'],
        costPerHour: 70,
        email: '',
        phone: '',
        status: 'active' as StaffStatus,
        createdAt: now,
        updatedAt: now
      }
    ];

    const availability: WeeklyAvailability[] = [1, 2, 3, 4, 5].map(day => ({
      id: `avail-${day}`,
      staffId: 's1',
      dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      slots: [{
        startTime: '09:00',
        endTime: '17:00'
      }],
      isAvailable: true
    }));

    const taskInstances: TaskInstance[] = [
      {
        id: 't1',
        templateId: 'temp',
        clientId: 'c1',
        name: 'Task 1',
        description: '',
        estimatedHours: 10,
        requiredSkills: ['CPA'],
        priority: 'Medium',
        category: 'Tax',
        status: 'Scheduled',
        dueDate: new Date('2023-06-03T12:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockedGetAllStaff.mockResolvedValue(staffMembers);
    mockedGetWeeklyAvailability.mockResolvedValue(availability);
    mockedGetTaskInstances.mockResolvedValue(taskInstances);
    mockedGetClientById.mockResolvedValue({
      id: 'c1',
      legalName: 'Client 1',
      primaryContact: '',
      email: '',
      phone: '',
      billingAddress: '',
      industry: 'Other',
      status: 'Active',
      expectedMonthlyRevenue: 0,
      paymentTerms: 'Net30',
      billingFrequency: 'Monthly',
      defaultTaskPriority: 'Medium',
      notificationPreferences: { emailReminders: true, taskNotifications: true },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const startDate = new Date('2023-06-01T00:00:00Z');
    const endDate = new Date('2023-06-07T23:59:59Z');

    const params: ForecastParameters = {
      mode: 'actual',
      timeframe: 'custom',
      dateRange: { startDate, endDate },
      granularity: 'weekly',
      includeSkills: 'all',
      skillAllocationStrategy: 'distribute'
    };

    const result = await generateForecast(params);

    const avgCost = (30 + 50 + 70) / 3;
    const expectedCost = 10 * avgCost;

    expect(result.financials[0].cost).toBeCloseTo(expectedCost);
  });
});
