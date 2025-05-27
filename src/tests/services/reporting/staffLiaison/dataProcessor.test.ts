
/**
 * Staff Liaison Data Processor Tests
 */

import { StaffLiaisonDataProcessor } from '@/services/reporting/staffLiaison/dataProcessor';
import { StaffLiaisonProcessingContext, ClientTasksByLiaisonContext } from '@/services/reporting/staffLiaison/types';

describe('StaffLiaisonDataProcessor', () => {
  let processor: StaffLiaisonDataProcessor;

  beforeEach(() => {
    processor = new StaffLiaisonDataProcessor();
  });

  const mockContext: StaffLiaisonProcessingContext = {
    clientsData: [
      {
        id: 'client-1',
        legal_name: 'Client A',
        staff_liaison_id: 'staff-1',
        expected_monthly_revenue: 5000,
        status: 'Active'
      },
      {
        id: 'client-2',
        legal_name: 'Client B',
        staff_liaison_id: null,
        expected_monthly_revenue: 3000,
        status: 'Active'
      }
    ],
    staffData: [
      { id: 'staff-1', full_name: 'John Doe' },
      { id: 'staff-2', full_name: 'Jane Smith' }
    ],
    recurringTasks: [
      {
        id: 'recurring-1',
        client_id: 'client-1',
        status: 'Completed',
        is_active: true
      }
    ],
    taskInstances: [
      {
        id: 'instance-1',
        client_id: 'client-1',
        status: 'In Progress'
      }
    ]
  };

  describe('processStaffLiaisonData', () => {
    it('should process staff liaison data correctly', () => {
      const result = processor.processStaffLiaisonData(mockContext);

      expect(result.summary).toHaveLength(2); // One assigned, one unassigned
      expect(result.availableStaff).toEqual(mockContext.staffData);
      expect(result.totalRevenue).toBe(8000);
      expect(result.totalClients).toBe(2);
      expect(result.totalTasks).toBe(2);

      // Check assigned staff liaison
      const assignedLiaison = result.summary.find(s => s.staffLiaisonId === 'staff-1');
      expect(assignedLiaison?.staffLiaisonName).toBe('John Doe');
      expect(assignedLiaison?.clientCount).toBe(1);
      expect(assignedLiaison?.expectedMonthlyRevenue).toBe(5000);

      // Check unassigned liaison
      const unassignedLiaison = result.summary.find(s => s.staffLiaisonId === null);
      expect(unassignedLiaison?.staffLiaisonName).toBe('Unassigned');
      expect(unassignedLiaison?.clientCount).toBe(1);
      expect(unassignedLiaison?.expectedMonthlyRevenue).toBe(3000);
    });

    it('should sort summary by revenue descending', () => {
      const result = processor.processStaffLiaisonData(mockContext);
      
      expect(result.summary[0].expectedMonthlyRevenue).toBeGreaterThanOrEqual(
        result.summary[1].expectedMonthlyRevenue
      );
    });
  });

  describe('processClientTasksByLiaison', () => {
    const mockTaskContext: ClientTasksByLiaisonContext = {
      liaisonId: 'staff-1',
      filters: {},
      clients: [
        { id: 'client-1', legal_name: 'Client A', expected_monthly_revenue: 5000 }
      ],
      clientMap: new Map([
        ['client-1', { id: 'client-1', legal_name: 'Client A', expected_monthly_revenue: 5000 }]
      ])
    };

    const mockRecurringTasks = [
      {
        id: 'recurring-1',
        client_id: 'client-1',
        name: 'Monthly Review',
        status: 'Active',
        priority: 'High',
        estimated_hours: 5,
        due_date: '2024-01-15'
      }
    ];

    const mockTaskInstances = [
      {
        id: 'instance-1',
        client_id: 'client-1',
        name: 'Ad-hoc Task',
        status: 'In Progress',
        priority: 'Medium',
        estimated_hours: 3,
        due_date: '2024-01-20'
      }
    ];

    it('should process client tasks by liaison correctly', () => {
      const result = processor.processClientTasksByLiaison(
        mockTaskContext,
        mockRecurringTasks,
        mockTaskInstances
      );

      expect(result).toHaveLength(2);
      
      // Check recurring task
      const recurringTask = result.find(t => t.taskType === 'recurring');
      expect(recurringTask?.taskName).toBe('Monthly Review');
      expect(recurringTask?.clientName).toBe('Client A');
      expect(recurringTask?.estimatedHours).toBe(5);
      
      // Check ad-hoc task
      const adhocTask = result.find(t => t.taskType === 'adhoc');
      expect(adhocTask?.taskName).toBe('Ad-hoc Task');
      expect(adhocTask?.clientName).toBe('Client A');
      expect(adhocTask?.estimatedHours).toBe(3);
    });
  });
});
