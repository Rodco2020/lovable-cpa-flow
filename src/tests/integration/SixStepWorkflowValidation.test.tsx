
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { CopyTasksTab } from '@/components/clients/TaskOperationsTab/CopyTasksTab';
import ClientTasksSection from '@/components/clients/ClientTasksSection';
import { vi } from 'vitest';

// Mock services with realistic data
const MOCK_CLIENTS = [
  { id: 'client-1', legalName: 'Acme Corporation', status: 'Active' },
  { id: 'client-2', legalName: 'Beta Industries', status: 'Active' },
  { id: 'client-3', legalName: 'Gamma Solutions', status: 'Active' },
];

const MOCK_TASKS = [
  { id: 'task-1', name: 'Monthly Tax Review', taskType: 'recurring', priority: 'High' },
  { id: 'task-2', name: 'Quarterly Audit', taskType: 'recurring', priority: 'Medium' },
  { id: 'task-3', name: 'Special Report', taskType: 'ad-hoc', priority: 'Low' },
];

vi.mock('@/services/clientService', () => ({
  getAllClients: vi.fn().mockResolvedValue(MOCK_CLIENTS),
}));

vi.mock('@/services/taskService', () => ({
  getClientTasks: vi.fn().mockResolvedValue(MOCK_TASKS),
}));

vi.mock('@/services/taskCopyService', () => ({
  copyClientTasks: vi.fn().mockResolvedValue({
    recurring: [MOCK_TASKS[0], MOCK_TASKS[1]],
    adHoc: [MOCK_TASKS[2]]
  }),
}));

describe('Six-Step Workflow Validation Tests', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TestWrapper>
          {component}
        </TestWrapper>
      </QueryClientProvider>
    );
  };

  describe('Entry Point 1: CopyClientTasksDialog', () => {
    it('should display complete 6-step workflow from dialog entry point', async () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
          sourceClientName="Acme Corporation"
        />
      );

      // Step 1: Source client should be pre-selected but still visible
      await waitFor(() => {
        expect(screen.getByText(/source client/i)).toBeInTheDocument();
      });

      // Step 2: Navigate to target client selection
      const nextButton = screen.getByText(/next/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/target client/i)).toBeInTheDocument();
      });

      // Step 3: Select target and proceed to task selection
      const targetClient = await screen.findByText('Beta Industries');
      await user.click(targetClient);

      const nextButton2 = screen.getByText(/next/i);
      await user.click(nextButton2);

      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });

      // Step 4: Select tasks and proceed to confirmation
      const taskCheckbox = screen.getByRole('checkbox', { name: /monthly tax review/i });
      await user.click(taskCheckbox);

      const nextButton3 = screen.getByText(/next/i);
      await user.click(nextButton3);

      await waitFor(() => {
        expect(screen.getByText(/confirm/i)).toBeInTheDocument();
      });

      // Step 5: Execute copy to see processing
      const copyButton = screen.getByText(/copy tasks/i);
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument();
      });

      // Step 6: Verify success completion
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      console.log('✅ Dialog entry point 6-step workflow validated');
    });
  });

  describe('Entry Point 2: Task Operations Tab', () => {
    it('should display complete 6-step workflow from tab entry point', async () => {
      renderWithProviders(
        <CopyTasksTab
          initialClientId="client-1"
          onTasksRefresh={() => {}}
        />
      );

      // Verify step indicator shows all 6 steps
      await waitFor(() => {
        expect(screen.getByText(/step 1 of 6/i)).toBeInTheDocument();
      });

      // Verify all step labels are present
      expect(screen.getByText(/source client/i)).toBeInTheDocument();
      expect(screen.getByText(/target client/i)).toBeInTheDocument();
      expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm/i)).toBeInTheDocument();
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      expect(screen.getByText(/complete/i)).toBeInTheDocument();

      console.log('✅ Task Operations Tab 6-step workflow validated');
    });
  });

  describe('Entry Point 3: Client Tasks Section', () => {
    it('should open 6-step workflow from client tasks section', async () => {
      const mockRefresh = vi.fn();
      
      renderWithProviders(
        <ClientTasksSection
          clientId="client-1"
          clientName="Acme Corporation"
          onRefreshClient={mockRefresh}
        />
      );

      // Find and click copy tasks button
      const copyButton = screen.getByText(/copy tasks/i);
      await user.click(copyButton);

      // Verify dialog opens with 6-step workflow
      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      // Verify step progression indicator
      expect(screen.getByText(/step 1 of/i)).toBeInTheDocument();

      console.log('✅ Client Tasks Section entry point validated');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty client list gracefully', async () => {
      // Mock empty client list
      vi.mocked(require('@/services/clientService').getAllClients)
        .mockResolvedValueOnce([]);

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/no clients available/i)).toBeInTheDocument();
      });

      console.log('✅ Empty client list handled gracefully');
    });

    it('should prevent progression without required selections', async () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      // Try to proceed without selecting source client
      const nextButton = screen.getByText(/next/i);
      expect(nextButton).toBeDisabled();

      console.log('✅ Validation prevents invalid progression');
    });

    it('should handle network errors during copy operation', async () => {
      // Mock network error
      vi.mocked(require('@/services/taskCopyService').copyClientTasks)
        .mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
        />
      );

      // Navigate through workflow quickly
      await waitFor(() => {
        expect(screen.getByText(/target client/i)).toBeInTheDocument();
      });

      const targetClient = await screen.findByText('Beta Industries');
      await user.click(targetClient);

      const nextButton = screen.getByText(/next/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });

      const taskCheckbox = screen.getByRole('checkbox', { name: /monthly tax review/i });
      await user.click(taskCheckbox);

      const nextButton2 = screen.getByText(/next/i);
      await user.click(nextButton2);

      const copyButton = await screen.findByText(/copy tasks/i);
      await user.click(copyButton);

      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      console.log('✅ Network errors handled gracefully');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with legacy props', async () => {
      // Test legacy clientId prop (backward compatibility)
      renderWithProviders(
        <CopyClientTasksDialog
          clientId="client-1"  // Legacy prop
          open={true}
          onOpenChange={() => {}}
          sourceClientName="Legacy Client"
        />
      );

      // Should still work with old prop name
      await waitFor(() => {
        expect(screen.getByText(/copy tasks between clients/i)).toBeInTheDocument();
      });

      console.log('✅ Legacy prop compatibility maintained');
    });

    it('should work without optional enhanced features', async () => {
      // Test with minimal props (backward compatibility)
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
        />
      );

      // Should still function without optional enhancements
      await waitFor(() => {
        expect(screen.getByText(/select source client/i)).toBeInTheDocument();
      });

      console.log('✅ Minimal configuration compatibility maintained');
    });
  });
});
