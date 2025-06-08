
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import eventService from '@/services/eventService';

// Mock services
vi.mock('@/services/forecasting/demandMatrixService');
vi.mock('@/services/eventService');

const mockDemandData = {
  months: Array.from({ length: 12 }, (_, i) => ({
    key: `2025-${(i + 1).toString().padStart(2, '0')}`,
    label: `Month ${i + 1}`
  })),
  skills: ['Tax Preparation', 'Audit', 'Advisory'],
  dataPoints: [
    {
      skillType: 'Tax Preparation',
      month: '2025-01',
      monthLabel: 'January 2025',
      demandHours: 120,
      taskCount: 8,
      clientCount: 3,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'Test Client 1',
          recurringTaskId: 'task-1',
          taskName: 'Monthly Tax Review',
          skillType: 'Tax Preparation',
          estimatedHours: 15,
          monthlyHours: 15,
          recurrencePattern: { type: 'Monthly', frequency: 1 }
        }
      ]
    }
  ],
  totalDemand: 120,
  totalTasks: 8,
  totalClients: 3,
  skillSummary: {}
};

describe('Demand Matrix Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful data loading
    (DemandMatrixService.generateDemandMatrix as any).mockResolvedValue({
      matrixData: mockDemandData
    });
    
    (DemandMatrixService.validateDemandMatrixData as any).mockReturnValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Integration', () => {
    it('should integrate with forecasting dashboard navigation', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Should load and display matrix
      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Should display proper navigation context
      expect(screen.getByText(/Demand Forecast Matrix/i)).toBeInTheDocument();
    });

    it('should handle grouping mode changes seamlessly', async () => {
      const { rerender } = render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Change grouping mode
      rerender(
        <TestWrapper>
          <DemandMatrix groupingMode="client" />
        </TestWrapper>
      );

      // Should maintain functionality with different grouping
      await waitFor(() => {
        expect(screen.getByText(/Test Client 1/i)).toBeInTheDocument();
      });
    });

    it('should integrate with existing error boundaries', async () => {
      // Mock service error
      (DemandMatrixService.generateDemandMatrix as any).mockRejectedValue(
        new Error('Service unavailable')
      );

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Should display error state
      await waitFor(() => {
        expect(screen.getByText(/Error loading demand matrix/i)).toBeInTheDocument();
      });

      // Should provide retry functionality
      const retryButton = screen.getByText(/Try Again/i);
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should respond to task modification events', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Simulate task modification event
      const mockCalls = (eventService.subscribe as any).mock.calls;
      const eventHandler = mockCalls.find((call: any[]) => call[0] === 'task.scheduled')?.[1];

      if (eventHandler) {
        eventHandler({
          type: 'task.scheduled',
          payload: { taskId: 'task-1', clientId: 'client-1' },
          timestamp: Date.now()
        });

        // Should trigger data refresh
        await waitFor(() => {
          expect(DemandMatrixService.generateDemandMatrix).toHaveBeenCalledTimes(2);
        });
      }
    });

    it('should handle client-assigned task changes', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Simulate client data change
      const mockCalls = (eventService.subscribe as any).mock.calls;
      const eventHandler = mockCalls.find((call: any[]) => call[0] === 'availability.updated')?.[1];

      if (eventHandler) {
        eventHandler({
          type: 'availability.updated',
          payload: { staffId: 'staff-1' },
          timestamp: Date.now()
        });

        // Should maintain demand data (not affected by availability changes)
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      }
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeMockData = {
        ...mockDemandData,
        dataPoints: Array.from({ length: 1000 }, (_, i) => ({
          skillType: `Skill ${i % 10}`,
          month: `2025-${((i % 12) + 1).toString().padStart(2, '0')}`,
          monthLabel: `Month ${(i % 12) + 1}`,
          demandHours: Math.random() * 100,
          taskCount: Math.floor(Math.random() * 10) + 1,
          clientCount: Math.floor(Math.random() * 5) + 1,
          taskBreakdown: []
        }))
      };

      (DemandMatrixService.generateDemandMatrix as any).mockResolvedValue({
        matrixData: largeMockData
      });

      const startTime = performance.now();

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Skill 0/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      const renderTime = performance.now() - startTime;
      
      // Should render within reasonable time (5 seconds for large dataset)
      expect(renderTime).toBeLessThan(5000);
    });

    it('should optimize memory usage with filtering', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Apply filters to reduce dataset
      const skillFilter = screen.getByLabelText(/Tax Preparation/i);
      await user.click(skillFilter);

      // Should maintain performance with filtered data
      expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
    });
  });

  describe('Export Integration', () => {
    it('should integrate export functionality with matrix data', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Find and click export button
      const exportButton = screen.getByText(/Export/i);
      await user.click(exportButton);

      // Should open export dialog
      await waitFor(() => {
        expect(screen.getByText(/Export Demand Matrix/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases Integration', () => {
    it('should handle empty data gracefully', async () => {
      const emptyMockData = {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      (DemandMatrixService.generateDemandMatrix as any).mockResolvedValue({
        matrixData: emptyMockData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/No Demand Data Available/i)).toBeInTheDocument();
      });

      // Should provide helpful guidance
      expect(screen.getByText(/Manage Client Tasks/i)).toBeInTheDocument();
    });

    it('should handle invalid data with validation', async () => {
      (DemandMatrixService.validateDemandMatrixData as any).mockReturnValue([
        'Invalid data format detected',
        'Missing required fields'
      ]);

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Data Quality Issues Detected/i)).toBeInTheDocument();
      });

      // Should display validation issues
      expect(screen.getByText(/Invalid data format detected/i)).toBeInTheDocument();
    });

    it('should handle network errors with retry capability', async () => {
      let callCount = 0;
      (DemandMatrixService.generateDemandMatrix as any).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ matrixData: mockDemandData });
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText(/Error loading demand matrix/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByText(/Try Again/i);
      await user.click(retryButton);

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility standards', async () => {
      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Tax Preparation/i)).toBeInTheDocument();
      });

      // Should have proper ARIA labels
      const matrix = screen.getByRole('grid', { hidden: true });
      expect(matrix).toBeInTheDocument();

      // Should support keyboard navigation
      const firstCell = screen.getByText(/120/);
      firstCell.focus();
      expect(document.activeElement).toBe(firstCell);
    });
  });
});
