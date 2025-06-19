
/**
 * Edge Case Integration Tests for Demand Matrix
 * Tests for handling unusual scenarios and edge cases
 */

import React from 'react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

vi.mock('@/services/forecasting/demandMatrixService');

describe('Edge Case Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Data Edge Cases', () => {
    test('handles tasks with no preferred staff assigned', async () => {
      const matrixDataWithoutStaff = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 50,
          taskCount: 2,
          clientCount: 1,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'Client A',
              taskName: 'Unassigned Task',
              skillType: 'Tax Preparation',
              estimatedHours: 25,
              monthlyHours: 25
              // No preferredStaff field
            }
          ]
        }],
        totalDemand: 50,
        totalTasks: 2,
        totalClients: 1,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: matrixDataWithoutStaff
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
        expect(screen.getByText('Unassigned Task')).toBeInTheDocument();
      });
    });

    test('handles tasks with preferred staff that no longer exist', async () => {
      const matrixDataWithDeletedStaff = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Advisory'],
        dataPoints: [{
          skillType: 'Advisory',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 30,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'Client A',
              taskName: 'Orphaned Task',
              skillType: 'Advisory',
              estimatedHours: 30,
              monthlyHours: 30,
              preferredStaff: {
                staffId: 'deleted-staff-1',
                staffName: 'Former Employee',
                roleTitle: 'Former CPA'
              }
            }
          ]
        }],
        totalDemand: 30,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: matrixDataWithDeletedStaff
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Advisory')).toBeInTheDocument();
        expect(screen.getByText('Orphaned Task')).toBeInTheDocument();
        expect(screen.getByText('Former Employee')).toBeInTheDocument();
      });
    });

    test('handles large datasets efficiently', async () => {
      // Generate large dataset
      const largeDataset = {
        months: Array.from({ length: 12 }, (_, i) => ({
          key: `2025-${(i + 1).toString().padStart(2, '0')}`,
          label: `Month ${i + 1}`
        })),
        skills: ['Tax Preparation', 'Advisory', 'Audit', 'Payroll', 'Bookkeeping'],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };

      // Generate 1000+ data points
      for (let month = 1; month <= 12; month++) {
        for (const skill of largeDataset.skills) {
          for (let task = 1; task <= 20; task++) {
            largeDataset.dataPoints.push({
              skillType: skill,
              month: `2025-${month.toString().padStart(2, '0')}`,
              monthLabel: `Month ${month}`,
              demandHours: Math.floor(Math.random() * 100),
              taskCount: Math.floor(Math.random() * 10),
              clientCount: Math.floor(Math.random() * 5),
              taskBreakdown: []
            });
          }
        }
      }

      largeDataset.totalDemand = largeDataset.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
      largeDataset.totalTasks = largeDataset.dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: largeDataset
      });

      const startTime = performance.now();

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large dataset within reasonable time (5 seconds)
      expect(renderTime).toBeLessThan(5000);
    });
  });

  describe('Service Error Scenarios', () => {
    test('handles network timeouts gracefully', async () => {
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading matrix data')).toBeInTheDocument();
      });
    });

    test('handles partial data corruption', async () => {
      const corruptedData = {
        months: null,
        skills: ['Tax Preparation'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: null,
            demandHours: 'invalid',
            taskCount: -1,
            clientCount: undefined
          }
        ],
        totalDemand: NaN,
        totalTasks: null,
        totalClients: undefined
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: corruptedData as any
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Data validation error')).toBeInTheDocument();
      });
    });

    test('handles empty response from service', async () => {
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: null as any
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No data available')).toBeInTheDocument();
      });
    });
  });

  describe('UI State Edge Cases', () => {
    test('handles rapid filter changes', async () => {
      const mockGenerateMatrix = vi.mocked(DemandMatrixService.generateDemandMatrix);
      mockGenerateMatrix.mockResolvedValue({
        matrixData: {
          months: [{ key: '2025-01', label: 'Jan 2025' }],
          skills: ['Tax Preparation'],
          dataPoints: [],
          totalDemand: 0,
          totalTasks: 0,
          totalClients: 0,
          skillSummary: {}
        }
      });

      const { rerender } = render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Rapidly change grouping modes
      for (let i = 0; i < 5; i++) {
        rerender(
          <TestWrapper>
            <DemandMatrix groupingMode={i % 2 === 0 ? "skill" : "client"} />
          </TestWrapper>
        );
      }

      await waitFor(() => {
        expect(mockGenerateMatrix).toHaveBeenCalled();
      });

      // Should handle rapid changes without crashing
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });

    test('handles browser memory constraints', async () => {
      // Simulate low memory scenario
      const originalPerformance = (window as any).performance;
      (window as any).performance = {
        ...originalPerformance,
        memory: {
          usedJSHeapSize: 100 * 1024 * 1024, // 100MB
          totalJSHeapSize: 120 * 1024 * 1024, // 120MB (close to limit)
          jsHeapSizeLimit: 128 * 1024 * 1024  // 128MB limit
        }
      };

      const largeDataset = {
        months: Array.from({ length: 12 }, (_, i) => ({ key: `2025-${i + 1}`, label: `Month ${i + 1}` })),
        skills: Array.from({ length: 50 }, (_, i) => `Skill ${i + 1}`),
        dataPoints: Array.from({ length: 5000 }, (_, i) => ({
          skillType: `Skill ${i % 50 + 1}`,
          month: `2025-${(i % 12) + 1}`,
          monthLabel: `Month ${(i % 12) + 1}`,
          demandHours: 10,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: []
        })),
        totalDemand: 50000,
        totalTasks: 5000,
        totalClients: 100,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: largeDataset
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Skill 1')).toBeInTheDocument();
      });

      // Restore original performance object
      (window as any).performance = originalPerformance;
    });

    test('handles concurrent filter operations', async () => {
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            matrixData: {
              months: [{ key: '2025-01', label: 'Jan 2025' }],
              skills: ['Tax Preparation'],
              dataPoints: [],
              totalDemand: 0,
              totalTasks: 0,
              totalClients: 0,
              skillSummary: {}
            }
          }), 50)
        )
      );

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      // Should handle multiple concurrent operations
      await waitFor(() => {
        expect(screen.queryByText('Loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Edge Cases', () => {
    test('maintains keyboard navigation with dynamic content', async () => {
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: {
          months: [{ key: '2025-01', label: 'Jan 2025' }],
          skills: ['Tax Preparation'],
          dataPoints: [{
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 100,
            taskCount: 5,
            clientCount: 3,
            taskBreakdown: []
          }],
          totalDemand: 100,
          totalTasks: 5,
          totalClients: 3,
          skillSummary: {}
        }
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        const matrixContainer = screen.getByRole('grid', { name: /demand matrix/i });
        expect(matrixContainer).toBeInTheDocument();
        expect(matrixContainer).toHaveAttribute('tabIndex', '0');
      });
    });

    test('provides appropriate ARIA labels for dynamic content', async () => {
      const mockData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 100,
          taskCount: 5,
          clientCount: 3,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Client A',
            taskName: 'Task 1',
            skillType: 'Tax Preparation',
            estimatedHours: 20,
            monthlyHours: 20,
            preferredStaff: {
              staffId: 'staff-1',
              staffName: 'Alice Johnson',
              roleTitle: 'Senior CPA'
            }
          }]
        }],
        totalDemand: 100,
        totalTasks: 5,
        totalClients: 3,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockData
      });

      render(
        <TestWrapper>
          <DemandMatrix groupingMode="skill" />
        </TestWrapper>
      );

      await waitFor(() => {
        const staffInfo = screen.getByText('Alice Johnson');
        expect(staffInfo).toHaveAttribute('aria-label', 'Preferred staff: Alice Johnson, Senior CPA');
      });
    });
  });
});
