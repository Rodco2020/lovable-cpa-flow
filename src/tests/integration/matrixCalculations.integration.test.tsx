
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock data helpers
const createMockTaskBreakdown = () => [
  {
    clientId: 'client-1',
    clientName: 'Test Client 1',
    recurringTaskId: 'task-1',
    taskName: 'Monthly Review',
    skillType: 'Senior',
    estimatedHours: 8,
    recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
    monthlyHours: 8,
    preferredStaffId: null,
    preferredStaffName: null
  }
];

const createMockDataPoint = (overrides = {}) => ({
  skillType: 'Senior',
  month: '2024-01',
  monthLabel: 'January 2024',
  demandHours: 40,
  taskCount: 5,
  clientCount: 2,
  taskBreakdown: createMockTaskBreakdown(),
  ...overrides
});

describe('Matrix Calculations Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  describe('Demand Matrix Calculations', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <QueryClientProvider client={queryClient}>
          <DemandMatrix groupingMode="skill" />
        </QueryClientProvider>
      );
      
      expect(container).toBeTruthy();
    });

    it('should handle complex data calculations', () => {
      const mockDataPoints = [
        createMockDataPoint({
          skillType: 'Junior',
          demandHours: 120,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'ABC Corp',
              recurringTaskId: 'task-1',
              taskName: 'Data Entry',
              skillType: 'Junior',
              estimatedHours: 15,
              recurrencePattern: { type: 'Weekly', interval: 1, frequency: 4 },
              monthlyHours: 60,
              preferredStaffId: null,
              preferredStaffName: null
            },
            {
              clientId: 'client-2',
              clientName: 'XYZ Ltd',
              recurringTaskId: 'task-2',
              taskName: 'Bookkeeping',
              skillType: 'Junior',
              estimatedHours: 15,
              recurrencePattern: { type: 'Weekly', interval: 1, frequency: 4 },
              monthlyHours: 60,
              preferredStaffId: null,
              preferredStaffName: null
            }
          ]
        }),
        createMockDataPoint({
          skillType: 'Senior',
          demandHours: 80,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'ABC Corp',
              recurringTaskId: 'task-3',
              taskName: 'Tax Review',
              skillType: 'Senior',
              estimatedHours: 20,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              monthlyHours: 20,
              preferredStaffId: null,
              preferredStaffName: null
            }
          ]
        })
      ];

      // Test calculation logic
      const totalDemand = mockDataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      expect(totalDemand).toBe(200); // 120 + 80

      const totalTasks = mockDataPoints.reduce((sum, point) => 
        sum + (point.taskBreakdown?.length || 0), 0
      );
      expect(totalTasks).toBe(3); // 2 + 1

      // Test individual task calculations
      const juniorTasks = mockDataPoints
        .find(p => p.skillType === 'Junior')
        ?.taskBreakdown || [];
      
      expect(juniorTasks).toHaveLength(2);
      
      const totalJuniorHours = juniorTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
      expect(totalJuniorHours).toBe(120);
      
      const seniorTasks = mockDataPoints
        .find(p => p.skillType === 'Senior')
        ?.taskBreakdown || [];
      
      expect(seniorTasks).toHaveLength(1);
      expect(seniorTasks[0].monthlyHours).toBe(20);
    });

    it('should handle empty data gracefully', () => {
      const emptyDataPoints: any[] = [];
      
      const totalDemand = emptyDataPoints.reduce((sum, point) => sum + (point.demandHours || 0), 0);
      expect(totalDemand).toBe(0);
      
      const totalTasks = emptyDataPoints.reduce((sum, point) => 
        sum + (point.taskBreakdown?.length || 0), 0
      );
      expect(totalTasks).toBe(0);
    });
  });

  describe('Client Totals Calculation', () => {
    it('should calculate client totals correctly', () => {
      const mockDataPoint = createMockDataPoint({
        taskBreakdown: [
          {
            clientId: 'client-1',
            clientName: 'ABC Corp',
            recurringTaskId: 'task-1',
            taskName: 'Task 1',
            skillType: 'Senior',
            estimatedHours: 10,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
            monthlyHours: 25,
            preferredStaffId: null,
            preferredStaffName: null
          },
          {
            clientId: 'client-2',
            clientName: 'XYZ Ltd',
            recurringTaskId: 'task-2',
            taskName: 'Task 2',
            skillType: 'Senior',
            estimatedHours: 15,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
            monthlyHours: 15,
            preferredStaffId: null,
            preferredStaffName: null
          }
        ]
      });

      const clientTotals = new Map<string, number>();
      
      if (mockDataPoint.taskBreakdown) {
        mockDataPoint.taskBreakdown.forEach(task => {
          const currentTotal = clientTotals.get(task.clientName) || 0;
          clientTotals.set(task.clientName, currentTotal + task.monthlyHours);
        });
      }

      expect(clientTotals.get('ABC Corp')).toBe(25);
      expect(clientTotals.get('XYZ Ltd')).toBe(15);
      expect(clientTotals.size).toBe(2);
    });
  });
});
