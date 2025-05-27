
/**
 * End-to-End Workflow Tests for Client Detail Report
 * 
 * Tests complete user workflows from client selection to export
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import ClientDetailReport from '@/components/reporting/ClientDetailReport';
import { getClientDetailReport, getClientsList } from '@/services/reporting/clientDetailReportService';

// Mock services
jest.mock('@/services/reporting/clientDetailReportService');
jest.mock('@/services/reporting/exportService');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockGetClientsList = getClientsList as jest.MockedFunction<typeof getClientsList>;
const mockGetClientDetailReport = getClientDetailReport as jest.MockedFunction<typeof getClientDetailReport>;

const mockClientsList = [
  { id: 'client-1', legalName: 'Acme Corporation' },
  { id: 'client-2', legalName: 'Tech Solutions Inc' }
];

const mockReportData = {
  client: {
    id: 'client-1',
    legalName: 'Acme Corporation',
    primaryContact: 'John Smith',
    email: 'john@acme.com',
    phone: '555-0123',
    industry: 'Technology',
    status: 'Active',
    staffLiaisonName: 'Jane Doe'
  },
  taskMetrics: {
    totalTasks: 15,
    completedTasks: 8,
    activeTasks: 7,
    overdueTasks: 2,
    totalEstimatedHours: 120,
    completedHours: 64,
    remainingHours: 56,
    completionRate: 53.3,
    averageTaskDuration: 8
  },
  revenueMetrics: {
    expectedMonthlyRevenue: 10000,
    ytdProjectedRevenue: 120000,
    taskValueBreakdown: [
      { category: 'Tax', estimatedValue: 6000, completedValue: 3000 },
      { category: 'Advisory', estimatedValue: 4000, completedValue: 2000 }
    ]
  },
  taskBreakdown: {
    recurring: [
      {
        taskId: 'rec-1',
        taskName: 'Monthly Tax Review',
        taskType: 'recurring' as const,
        category: 'Tax',
        status: 'Active',
        priority: 'High',
        estimatedHours: 8,
        dueDate: new Date('2024-02-15'),
        assignedStaffName: 'Tax Specialist'
      }
    ],
    adhoc: [
      {
        taskId: 'adhoc-1',
        taskName: 'Special Analysis',
        taskType: 'adhoc' as const,
        category: 'Advisory',
        status: 'In Progress',
        priority: 'Medium',
        estimatedHours: 12,
        dueDate: new Date('2024-02-20'),
        assignedStaffName: 'Senior Advisor'
      }
    ]
  },
  timeline: [
    { month: '2024-01', tasksCompleted: 3, revenue: 5000 },
    { month: '2024-02', tasksCompleted: 5, revenue: 7500 }
  ]
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Client Detail Report - End-to-End Workflows', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClientsList.mockResolvedValue(mockClientsList);
    mockGetClientDetailReport.mockResolvedValue(mockReportData);
  });

  describe('Complete Report Generation Workflow', () => {
    it('should complete full workflow from client selection to report viewing', async () => {
      renderWithProviders(<ClientDetailReport />);

      // 1. Initial state - should show client selection
      expect(screen.getByText('Client Detail Reports')).toBeInTheDocument();
      expect(screen.getByText('Select Client')).toBeInTheDocument();

      // 2. Wait for clients to load and select one
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // 3. Select a client
      const clientOption = await screen.findByText('Acme Corporation');
      await user.click(clientOption);

      // 4. Wait for report to load
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation - Detail Report')).toBeInTheDocument();
      });

      // 5. Verify report content is displayed
      expect(screen.getByText('Comprehensive analysis and task breakdown')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Task Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Charts & Analytics')).toBeInTheDocument();

      // 6. Test tab navigation
      const taskBreakdownTab = screen.getByText('Task Breakdown');
      await user.click(taskBreakdownTab);

      // 7. Test charts tab
      const chartsTab = screen.getByText('Charts & Analytics');
      await user.click(chartsTab);

      // 8. Test action buttons are available
      expect(screen.getByText('Change Client')).toBeInTheDocument();
      expect(screen.getByText('Customize')).toBeInTheDocument();
      expect(screen.getByText('Print')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should handle client change workflow', async () => {
      renderWithProviders(<ClientDetailReport />);

      // Select initial client
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const clientOption = await screen.findByText('Acme Corporation');
      await user.click(clientOption);

      // Wait for report to load
      await waitFor(() => {
        expect(screen.getByText('Acme Corporation - Detail Report')).toBeInTheDocument();
      });

      // Click change client
      const changeClientBtn = screen.getByText('Change Client');
      await user.click(changeClientBtn);

      // Should show confirmation dialog
      expect(screen.getByText('Change Client')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to change the client?')).toBeInTheDocument();

      // Confirm change
      const confirmBtn = screen.getByText('Change Client');
      await user.click(confirmBtn);

      // Should return to client selection
      await waitFor(() => {
        expect(screen.getByText('Client Detail Reports')).toBeInTheDocument();
        expect(screen.getByText('Select Client')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle report generation errors gracefully', async () => {
      mockGetClientDetailReport.mockRejectedValue(new Error('Failed to fetch report data'));

      renderWithProviders(<ClientDetailReport />);

      // Select client
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const clientOption = await screen.findByText('Acme Corporation');
      await user.click(clientOption);

      // Should show error screen
      await waitFor(() => {
        expect(screen.getByText('Failed to Load Report')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should handle empty client list gracefully', async () => {
      mockGetClientsList.mockResolvedValue([]);

      renderWithProviders(<ClientDetailReport />);

      await waitFor(() => {
        expect(screen.getByText('Client Detail Reports')).toBeInTheDocument();
      });

      // Should show appropriate message for empty list
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Accessibility Workflows', () => {
    it('should support keyboard navigation', async () => {
      renderWithProviders(<ClientDetailReport />);

      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'combobox');

      // Test escape key functionality
      await user.keyboard('{Escape}');
    });

    it('should provide proper ARIA labels and roles', async () => {
      renderWithProviders(<ClientDetailReport />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      // Select client and wait for report
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      const clientOption = await screen.findByText('Acme Corporation');
      await user.click(clientOption);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
      });

      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});
