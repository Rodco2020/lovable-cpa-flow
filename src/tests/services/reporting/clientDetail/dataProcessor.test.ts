
/**
 * Client Detail Data Processor Tests
 */

import { ClientDetailDataProcessor } from '@/services/reporting/clientDetail/dataProcessor';
import { ClientDetailProcessingContext } from '@/services/reporting/clientDetail/types';

describe('ClientDetailDataProcessor', () => {
  let processor: ClientDetailDataProcessor;

  beforeEach(() => {
    processor = new ClientDetailDataProcessor();
  });

  const mockContext: ClientDetailProcessingContext = {
    client: {
      id: 'client-1',
      legal_name: 'Test Client',
      primary_contact: 'John Doe',
      email: 'john@test.com',
      phone: '123-456-7890',
      industry: 'Technology',
      status: 'Active',
      expected_monthly_revenue: 5000
    },
    recurringTasks: [
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
    ],
    taskInstances: [
      {
        id: 'instance-1',
        name: 'Ad-hoc Task',
        category: 'Analysis',
        status: 'In Progress',
        priority: 'Medium',
        estimated_hours: 3,
        due_date: '2024-01-20',
        completed_at: null,
        assigned_staff_id: 'staff-1',
        notes: 'Special analysis task'
      }
    ],
    staffMap: new Map([['staff-1', 'Jane Smith']])
  };

  describe('processClientReportData', () => {
    it('should process complete client report data correctly', () => {
      const result = processor.processClientReportData(mockContext, 'Jane Smith');

      expect(result.client.id).toBe('client-1');
      expect(result.client.legalName).toBe('Test Client');
      expect(result.client.staffLiaisonName).toBe('Jane Smith');
      expect(result.taskMetrics.totalTasks).toBe(2);
      expect(result.taskMetrics.completedTasks).toBe(1);
      expect(result.taskMetrics.activeTasks).toBe(1);
      expect(result.revenueMetrics.expectedMonthlyRevenue).toBe(5000);
      expect(result.taskBreakdown.recurring).toHaveLength(1);
      expect(result.taskBreakdown.adhoc).toHaveLength(1);
      expect(result.timeline).toHaveLength(12);
    });

    it('should handle empty staff liaison name', () => {
      const result = processor.processClientReportData(mockContext);
      expect(result.client.staffLiaisonName).toBeUndefined();
    });
  });

  describe('task metrics calculation', () => {
    it('should calculate task metrics correctly', () => {
      const result = processor.processClientReportData(mockContext);
      
      expect(result.taskMetrics.totalTasks).toBe(2);
      expect(result.taskMetrics.completedTasks).toBe(1);
      expect(result.taskMetrics.activeTasks).toBe(1);
      expect(result.taskMetrics.overdueTasks).toBe(0);
      expect(result.taskMetrics.totalEstimatedHours).toBe(8);
      expect(result.taskMetrics.completedHours).toBe(5);
      expect(result.taskMetrics.remainingHours).toBe(3);
      expect(result.taskMetrics.completionRate).toBe(50);
      expect(result.taskMetrics.averageTaskDuration).toBe(5);
    });
  });

  describe('revenue metrics calculation', () => {
    it('should calculate revenue metrics correctly', () => {
      const result = processor.processClientReportData(mockContext);
      
      expect(result.revenueMetrics.expectedMonthlyRevenue).toBe(5000);
      expect(result.revenueMetrics.ytdProjectedRevenue).toBe(60000);
      expect(result.revenueMetrics.taskValueBreakdown).toHaveLength(2);
      
      const reviewCategory = result.revenueMetrics.taskValueBreakdown.find(b => b.category === 'Review');
      expect(reviewCategory?.estimatedValue).toBe(750); // 5 hours * $150
      expect(reviewCategory?.completedValue).toBe(750); // Completed task
      
      const analysisCategory = result.revenueMetrics.taskValueBreakdown.find(b => b.category === 'Analysis');
      expect(analysisCategory?.estimatedValue).toBe(450); // 3 hours * $150
      expect(analysisCategory?.completedValue).toBe(0); // In progress task
    });
  });
});
