
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from '../quality/testUtils/TestWrapper';
import { EnhancedTaskSelectionList } from '@/components/clients/CopyTasks/components/EnhancedTaskSelectionList';
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

  it('should handle 1000+ tasks efficiently', () => {
    const largeTasks = Array.from({ length: 1500 }, (_, i) => ({
      id: `task-${i}`,
      name: `Task ${i}`,
      type: 'recurring' as const,
      category: `Category ${i % 10}`,
      priority: ['Low', 'Medium', 'High'][i % 3] as 'Low' | 'Medium' | 'High',
      estimatedHours: 2,
      requiredSkills: ['Skill A'],
      description: `Description for task ${i}`,
      status: 'Active' as const,
      clientId: 'client-1',
      templateId: 'template-1',
      recurrenceType: 'monthly' as const,
      recurrenceInterval: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      type: 'recurring' as const,
      category: 'Test',
      priority: 'Medium' as const,
      estimatedHours: 2,
      requiredSkills: ['Skill A'],
      description: `Description ${i}`,
      status: 'Active' as const,
      clientId: 'client-1',
      templateId: 'template-1',
      recurrenceType: 'monthly' as const,
      recurrenceInterval: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
