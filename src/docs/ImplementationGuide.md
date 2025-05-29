
# Implementation Guide for Task Copying Module

## Architecture Overview

The Task Copying module follows a layered architecture:

1. **Presentation Layer**: Dialog and step components
2. **State Management Layer**: Custom hooks for workflow state
3. **Data Access Layer**: Service integration for client and task data
4. **Validation Layer**: Cross-cutting validation logic

## Component Structure

```
components/clients/CopyTasks/
├── components/                  # Reusable UI components
│   ├── EnhancedLoadingState     # Loading state components
│   ├── HelpTooltip              # Context-sensitive help
│   ├── ValidationMessagePanel   # Validation feedback
│   └── ...                      # Other UI components
├── hooks/                       # Custom state management hooks
│   ├── useCopyDialogState       # Manages dialog state and data flow
│   ├── useCopyTasksDialog       # Controls workflow and navigation
│   ├── usePerformanceMonitoring # Performance tracking
│   └── ...                      # Other hooks
├── CopyDialogStepRenderer       # Orchestrates the display of steps
├── SelectSourceClientStep       # Step 1: Source client selection
├── SelectTargetClientStep       # Step 2: Target client selection
├── SelectTasksStep              # Step 3: Task selection
└── ...                          # Other step components
```

## Integration Guide

### Basic Integration

```tsx
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>Copy Tasks</Button>
      
      <CopyClientTasksDialog
        open={open}
        onOpenChange={setOpen}
        defaultSourceClientId="client-123"
        sourceClientName="Example Client"
      />
    </>
  );
}
```

### Advanced Integration

```tsx
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';

function MyAdvancedComponent() {
  const [open, setOpen] = useState(false);
  const { mutate: refreshData } = useQueryClient();
  
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    
    // Refresh data when dialog closes (indicating possible completion)
    if (!isOpen) {
      refreshData(['clients']);
      refreshData(['tasks']);
    }
  };
  
  return (
    <CopyClientTasksDialog
      open={open}
      onOpenChange={handleOpenChange}
      defaultSourceClientId="client-123"
      sourceClientName="Example Client"
    />
  );
}
```

## Testing Framework

The module includes comprehensive testing:

1. **Unit Tests**: Test individual components and hooks
2. **Integration Tests**: Test workflow navigation and data flow
3. **End-to-end Tests**: Test complete workflows
4. **Performance Tests**: Test rendering and operation performance

### Writing Tests

```tsx
// Example test for a workflow step
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectTargetClientStep } from './SelectTargetClientStep';

describe('SelectTargetClientStep', () => {
  it('should allow selecting a target client', async () => {
    const mockOnSelect = vi.fn();
    const user = userEvent.setup();
    
    render(
      <SelectTargetClientStep
        sourceClientId="source-1"
        targetClientId={null}
        onSelectClient={mockOnSelect}
        availableClients={[
          { id: 'client-1', legalName: 'Test Client' }
        ]}
        isLoading={false}
      />
    );
    
    const clientOption = screen.getByText('Test Client');
    await user.click(clientOption);
    
    expect(mockOnSelect).toHaveBeenCalledWith('client-1');
  });
});
```

## Performance Considerations

For optimal performance:

1. Use virtualized lists for large data sets
2. Implement memoization for expensive computations
3. Use optimistic UI updates for better perceived performance
4. Monitor performance with the `usePerformanceMonitoring` hook

### Performance Monitoring

```tsx
import { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';

function MyComponent() {
  const { startTiming, endTiming, metrics } = usePerformanceMonitoring();
  
  const handleOperation = () => {
    startTiming('operation');
    // Perform operation
    const duration = endTiming('operation');
    console.log(`Operation completed in ${duration}ms`);
  };
  
  return (
    <>
      {/* UI components */}
      <div className="debug-panel">
        Last render time: {metrics.renderTime}ms
      </div>
    </>
  );
}
```

## Deployment Checklist

Before deploying:

- [ ] Run all test suites to verify functionality
- [ ] Check bundle size impact
- [ ] Verify browser compatibility
- [ ] Ensure accessibility compliance
- [ ] Document any breaking changes
- [ ] Update integration documentation
