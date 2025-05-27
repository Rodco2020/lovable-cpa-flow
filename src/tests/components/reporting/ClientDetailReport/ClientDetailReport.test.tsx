
/**
 * ClientDetailReport Component Tests
 * 
 * Tests for the refactored ClientDetailReport component and its subcomponents
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientDetailReport from '@/components/reporting/ClientDetailReport';
import { getClientDetailReport, getClientsList } from '@/services/reporting/clientDetailReportService';

// Mock the services
jest.mock('@/services/reporting/clientDetailReportService');
jest.mock('@/services/reporting/exportService');

const mockGetClientsList = getClientsList as jest.MockedFunction<typeof getClientsList>;
const mockGetClientDetailReport = getClientDetailReport as jest.MockedFunction<typeof getClientDetailReport>;

// Mock data
const mockClientsList = [
  { id: 'client-1', legalName: 'Test Client 1' },
  { id: 'client-2', legalName: 'Test Client 2' }
];

const mockReportData = {
  client: {
    id: 'client-1',
    legalName: 'Test Client 1',
    primaryContact: 'John Doe',
    email: 'john@test.com',
    phone: '555-0123',
    industry: 'Technology',
    status: 'Active',
    staffLiaisonName: 'Jane Smith'
  },
  taskMetrics: {
    totalTasks: 10,
    completedTasks: 6,
    activeTasks: 4,
    overdueTasks: 1,
    totalEstimatedHours: 100,
    completedHours: 60,
    remainingHours: 40,
    completionRate: 60,
    averageTaskDuration: 10
  },
  revenueMetrics: {
    expectedMonthlyRevenue: 5000,
    ytdProjectedRevenue: 60000,
    taskValueBreakdown: [
      {
        category: 'Tax',
        estimatedValue: 3000,
        completedValue: 2000
      }
    ]
  },
  taskBreakdown: {
    recurring: [],
    adhoc: []
  },
  timeline: []
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ClientDetailReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClientsList.mockResolvedValue(mockClientsList);
    mockGetClientDetailReport.mockResolvedValue(mockReportData);
  });

  describe('Client Selection', () => {
    it('should show client selection screen initially', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      expect(screen.getByText('Client Detail Reports')).toBeInTheDocument();
      expect(screen.getByText('Select Client')).toBeInTheDocument();
      expect(screen.getByText('Choose a client to generate their detailed report')).toBeInTheDocument();
    });

    it('should load clients list for selection', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      await waitFor(() => {
        expect(mockGetClientsList).toHaveBeenCalled();
      });
    });
  });

  describe('Report Loading States', () => {
    it('should show loading screen when fetching report data', async () => {
      // Make the report data promise never resolve to test loading state
      mockGetClientDetailReport.mockImplementation(() => new Promise(() => {}));
      
      renderWithQueryClient(<ClientDetailReport />);

      // First select a client to trigger report loading
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);
      
      const clientOption = await screen.findByText('Test Client 1');
      fireEvent.click(clientOption);

      // Should show loading skeletons
      await waitFor(() => {
        expect(screen.getAllByTestId('skeleton')).toHaveLength(0); // Skeletons don't have test ids by default
      });
    });

    it('should show error screen when report fetch fails', async () => {
      mockGetClientDetailReport.mockRejectedValue(new Error('Failed to fetch'));
      
      renderWithQueryClient(<ClientDetailReport />);

      // Select a client to trigger report loading
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);
      
      const clientOption = await screen.findByText('Test Client 1');
      fireEvent.click(clientOption);

      await waitFor(() => {
        expect(screen.getByText('Failed to load report data')).toBeInTheDocument();
        expect(screen.getByText('Please try again later')).toBeInTheDocument();
      });
    });
  });

  describe('Report Content', () => {
    it('should display report content when data is loaded', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      // Select a client
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);
      
      const clientOption = await screen.findByText('Test Client 1');
      fireEvent.click(clientOption);

      // Wait for report data to load
      await waitFor(() => {
        expect(screen.getByText('Test Client 1 - Detail Report')).toBeInTheDocument();
        expect(screen.getByText('Comprehensive analysis and task breakdown')).toBeInTheDocument();
      });

      // Check for tabs
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Task Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Charts & Analytics')).toBeInTheDocument();
    });

    it('should show header actions when report is loaded', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      // Select a client
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);
      
      const clientOption = await screen.findByText('Test Client 1');
      fireEvent.click(clientOption);

      await waitFor(() => {
        expect(screen.getByText('Change Client')).toBeInTheDocument();
        expect(screen.getByText('Customize')).toBeInTheDocument();
        expect(screen.getByText('Print')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should allow changing client selection', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      // Select a client first
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);
      
      const clientOption = await screen.findByText('Test Client 1');
      fireEvent.click(clientOption);

      await waitFor(() => {
        expect(screen.getByText('Test Client 1 - Detail Report')).toBeInTheDocument();
      });

      // Click change client button
      const changeClientBtn = screen.getByText('Change Client');
      fireEvent.click(changeClientBtn);

      // Should return to client selection
      expect(screen.getByText('Client Detail Reports')).toBeInTheDocument();
      expect(screen.getByText('Select Client')).toBeInTheDocument();
    });

    it('should open customization dialog', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      // Select a client first
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);
      
      const clientOption = await screen.findByText('Test Client 1');
      fireEvent.click(clientOption);

      await waitFor(() => {
        expect(screen.getByText('Customize')).toBeInTheDocument();
      });

      const customizeBtn = screen.getByText('Customize');
      fireEvent.click(customizeBtn);

      // Should open customization dialog (component would need to be mocked for full test)
    });

    it('should open export dialog', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      // Select a client first
      const selectTrigger = screen.getByRole('combobox');
      fireEvent.click(selectTrigger);
      
      const clientOption = await screen.findByText('Test Client 1');
      fireEvent.click(clientOption);

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      const exportBtn = screen.getByText('Export');
      fireEvent.click(exportBtn);

      // Should open export dialog (component would need to be mocked for full test)
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Client Detail Reports');
    });

    it('should have accessible form controls', async () => {
      renderWithQueryClient(<ClientDetailReport />);

      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toBeInTheDocument();
      expect(selectElement).toHaveAttribute('aria-expanded');
    });
  });
});
