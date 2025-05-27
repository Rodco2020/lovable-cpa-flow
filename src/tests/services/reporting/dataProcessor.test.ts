
/**
 * Reporting Data Processor Tests
 */

import { ReportingDataProcessor } from '@/services/reporting/dataProcessor';

// Mock data for testing
const mockClient = {
  id: 'client-1',
  legal_name: 'Test Client',
  primary_contact: 'John Doe',
  email: 'john@test.com',
  phone: '123-456-7890',
  industry: 'Technology',
  status: 'Active',
  expected_monthly_revenue: 5000,
  staff: { full_name: 'Jane Smith' }
};

const mockRecurringTasks = [
  {
    id: 'recurring-1',
    name: 'Monthly Review',
    category: 'Review',
    status: 'Completed',
    priority: 'High',
    estimated_hours: 5,
    due_date: '2024-01-15',
    notes: 'Regular monthly review'
  }
];

const mockTaskInstances = [
  {
    id: 'instance-1',
    name: 'Ad-hoc Task',
    category: 'Analysis',
    status: 'In Progress',
    priority: 'Medium',
    estimated_hours: 3,
    due_date: '2024-01-20',
    completed_at: null,
    notes: 'Special analysis task'
  }
];

describe('ReportingDataProcessor', () => {
  let processor: ReportingDataProcessor;

  beforeEach(() => {
    processor = new ReportingDataProcessor();
  });

  it('should process client report data correctly', () => {
    const result = processor.processClientReportData(
      mockClient,
      mockRecurringTasks,
      mockTaskInstances
    );

    expect(result.client.id).toBe('client-1');
    expect(result.client.legalName).toBe('Test Client');
    expect(result.client.staffLiaisonName).toBe('Jane Smith');
    expect(result.taskMetrics.totalTasks).toBe(2);
    expect(result.taskMetrics.completedTasks).toBe(1);
    expect(result.taskMetrics.activeTasks).toBe(1);
    expect(result.revenueMetrics.expectedMonthlyRevenue).toBe(5000);
    expect(result.taskBreakdown.recurring).toHaveLength(1);
    expect(result.taskBreakdown.adhoc).toHaveLength(1);
  });

  it('should process staff liaison data correctly', () => {
    const mockData = [
      {
        staff_id: 'staff-1',
        staff_name: 'John Doe',
        client_count: 5,
        total_revenue: 25000,
        active_tasks: 10,
        completed_tasks: 8,
        total_tasks: 18,
        avg_revenue_per_client: 5000,
        completion_rate: 44.44
      }
    ];

    const result = processor.processStaffLiaisonData(mockData);

    expect(result.summary).toHaveLength(1);
    expect(result.summary[0].staffLiaisonName).toBe('John Doe');
    expect(result.summary[0].clientCount).toBe(5);
    expect(result.totalRevenue).toBe(25000);
    expect(result.totalClients).toBe(5);
    expect(result.totalTasks).toBe(18);
  });
});

