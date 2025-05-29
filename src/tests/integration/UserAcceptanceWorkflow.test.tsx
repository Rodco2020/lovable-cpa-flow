
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';
import { vi } from 'vitest';

// Mock realistic user scenarios
const MOCK_CLIENTS = [
  { id: 'client-1', legalName: 'Acme Corporation', status: 'Active', industry: 'Technology' },
  { id: 'client-2', legalName: 'Beta Industries', status: 'Active', industry: 'Manufacturing' },
  { id: 'client-3', legalName: 'Gamma Solutions', status: 'Inactive', industry: 'Consulting' },
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

describe('User Acceptance Testing - Copy Workflow', () => {
  let queryClient: QueryClient;
  const user = userEvent.setup();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
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

  describe('User Story: New user copies tasks for the first time', () => {
    it('should guide new user through complete workflow with clear instructions', async () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
          sourceClientName="Acme Corporation"
        />
      );

      // Step 1: User sees clear target client selection
      await waitFor(() => {
        expect(screen.getByText(/select target client/i)).toBeInTheDocument();
      });

      // Verify FROM/TO visual distinction
      expect(screen.getByText(/from:/i)).toBeInTheDocument();
      expect(screen.getByText(/acme corporation/i)).toBeInTheDocument();

      // Step 2: User selects target client
      const targetClient = await screen.findByText('Beta Industries');
      await user.click(targetClient);

      // Verify progress indication
      expect(screen.getByText(/step 2 of/i)).toBeInTheDocument();

      // Step 3: User sees task selection with guidance
      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });

      // User sees task categories clearly marked
      expect(screen.getByText(/recurring/i)).toBeInTheDocument();
      expect(screen.getByText(/ad-hoc/i)).toBeInTheDocument();

      // Step 4: User selects tasks
      const taskCheckbox = screen.getByRole('checkbox', { name: /monthly tax review/i });
      await user.click(taskCheckbox);

      // Step 5: User confirms operation
      const nextButton = screen.getByText(/next/i);
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm/i)).toBeInTheDocument();
      });

      // User sees clear summary
      expect(screen.getByText(/beta industries/i)).toBeInTheDocument();
      expect(screen.getByText(/1.*task/i)).toBeInTheDocument();

      // Step 6: User executes copy
      const copyButton = screen.getByText(/copy tasks/i);
      await user.click(copyButton);

      // Step 7: User sees processing with progress
      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument();
      });

      // Step 8: User sees success confirmation
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('User Story: Power user efficiently copies multiple task sets', () => {
    it('should support rapid task selection and bulk operations', async () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
        />
      );

      // Navigate quickly to task selection
      await waitFor(() => {
        expect(screen.getByText(/select target client/i)).toBeInTheDocument();
      });

      const targetClient = await screen.findByText('Beta Industries');
      await user.click(targetClient);

      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });

      // Power user uses bulk selection
      const selectAllButton = screen.getByText(/select all/i);
      await user.click(selectAllButton);

      // Verify all tasks selected
      const selectedCount = screen.getByText(/3.*selected/i);
      expect(selectedCount).toBeInTheDocument();

      // Quick filtering
      const recurringFilter = screen.getByText(/recurring only/i);
      await user.click(recurringFilter);

      // Verify filter works
      expect(screen.getByText(/2.*selected/i)).toBeInTheDocument();

      // Proceed to completion
      const nextButton = screen.getByText(/next/i);
      await user.click(nextButton);

      const copyButton = await screen.findByText(/copy tasks/i);
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('User Story: Error recovery and validation', () => {
    it('should handle user errors gracefully with clear guidance', async () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
        />
      );

      // User tries to proceed without selecting target
      await waitFor(() => {
        expect(screen.getByText(/select target client/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByText(/next/i);
      await user.click(nextButton);

      // User sees validation message
      expect(screen.getByText(/target client is required/i)).toBeInTheDocument();

      // User selects target and proceeds
      const targetClient = await screen.findByText('Beta Industries');
      await user.click(targetClient);

      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });

      // User tries to proceed without selecting tasks
      const nextButton2 = screen.getByText(/next/i);
      await user.click(nextButton2);

      // User sees task selection validation
      expect(screen.getByText(/at least one task/i)).toBeInTheDocument();

      // User goes back to fix selection
      const backButton = screen.getByText(/back/i);
      await user.click(backButton);

      // User is back at target selection
      expect(screen.getByText(/select target client/i)).toBeInTheDocument();
    });
  });

  describe('User Story: Accessibility and keyboard navigation', () => {
    it('should support keyboard-only navigation', async () => {
      renderWithProviders(
        <CopyClientTasksDialog
          open={true}
          onOpenChange={() => {}}
          defaultSourceClientId="client-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/select target client/i)).toBeInTheDocument();
      });

      // Tab navigation works
      await user.tab();
      await user.tab();

      // Enter selects client
      await user.keyboard('{Enter}');

      // Verify selection with keyboard
      const selectedClient = screen.getByText(/selected/i);
      expect(selectedClient).toBeInTheDocument();

      // Continue with keyboard navigation
      await user.tab();
      await user.keyboard('{Enter}'); // Next button

      await waitFor(() => {
        expect(screen.getByText(/select tasks/i)).toBeInTheDocument();
      });

      // Space bar selects tasks
      await user.tab();
      await user.keyboard(' ');

      // Verify task selection
      expect(screen.getByText(/1.*selected/i)).toBeInTheDocument();
    });
  });
});
