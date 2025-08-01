
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import { EnhancedTaskSelectionList } from '@/components/clients/CopyTasks/components/EnhancedTaskSelectionList';
import { TaskCategory, TaskStatus } from '@/types/task';
import { vi } from 'vitest';

describe('Large Dataset Performance Tests', () => {
  let queryClient: QueryClient;

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

  const validCategories: TaskCategory[] = ["Tax", "Audit", "Advisory", "Compliance", "Bookkeeping", "Other"];
  const validStatuses: TaskStatus[] = ["Unscheduled", "Scheduled", "In Progress", "Completed", "Canceled"];

  it('should handle 1000+ tasks efficiently', () => {
    const largeTasks = Array.from({ length: 1500 }, (_, i) => ({
      id: `task-${i}`,
      name: `Task ${i}`,
      taskType: 'recurring' as const,
      category: validCategories[i % validCategories.length],
      priority: ['Low', 'Medium', 'High'][i % 3] as 'Low' | 'Medium' | 'High',
      estimatedHours: 2,
      requiredSkills: ['Skill A'],
      description: `Description for task ${i}`,
      status: validStatuses[i % validStatuses.length],
      clientId: 'client-1',
      templateId: 'template-1',
      recurrencePattern: {
        type: 'Monthly' as const,
        interval: 1
      },
      lastGeneratedDate: null,
      isActive: true,
      dueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const startTime = performance.now();
    
    renderWithProviders(
      <EnhancedTaskSelectionList
        tasks={largeTasks}
        selectedTaskIds={[]}
        onToggleTask={() => {}}
        isLoading={false}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Ensure large datasets render within acceptable time
    expect(renderTime).toBeLessThan(2000); // 2 seconds max for 1500 items
    expect(screen.getByText('Task 0')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('should handle frequent selection changes efficiently', () => {
    const tasks = Array.from({ length: 100 }, (_, i) => ({
      id: `task-${i}`,
      name: `Task ${i}`,
      taskType: 'recurring' as const,
      category: 'Tax' as TaskCategory,
      priority: 'Medium' as const,
      estimatedHours: 2,
      requiredSkills: ['Skill A'],
      description: `Description ${i}`,
      status: 'Unscheduled' as TaskStatus,
      clientId: 'client-1',
      templateId: 'template-1',
      recurrencePattern: {
        type: 'Monthly' as const,
        interval: 1
      },
      lastGeneratedDate: null,
      isActive: true,
      dueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const onToggleTask = vi.fn();
    const startTime = performance.now();

    renderWithProviders(
      <EnhancedTaskSelectionList
        tasks={tasks}
        selectedTaskIds={Array.from({ length: 50 }, (_, i) => `task-${i}`)}
        onToggleTask={onToggleTask}
        isLoading={false}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Ensure selection state changes are efficient
    expect(renderTime).toBeLessThan(200); // 200ms max
    expect(screen.getAllByRole('checkbox')).toHaveLength(100);
  });
});
