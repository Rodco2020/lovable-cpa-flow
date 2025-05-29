
# Task Copying Component Guide

## Overview

The Task Copying functionality allows users to copy tasks between clients efficiently. This document provides guidance on how to use, integrate, and extend this component in your application.

## Components

### CopyClientTasksDialog

The main component that orchestrates the task copying workflow.

```tsx
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';

// Basic usage
<CopyClientTasksDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  defaultSourceClientId="client-123"
  sourceClientName="Acme Corp"
/>

// Legacy usage (backward compatible)
<CopyClientTasksDialog
  clientId="client-123"
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
/>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| open | boolean | Yes | Controls the visibility of the dialog |
| onOpenChange | (open: boolean) => void | Yes | Callback when dialog visibility changes |
| defaultSourceClientId | string | No | The preferred client ID to use as source |
| clientId | string | No | Legacy prop for source client ID (use defaultSourceClientId instead) |
| sourceClientName | string | No | Display name for the source client (for UI purposes) |

### Integration in Parent Components

```tsx
import CopyClientTasksDialog from '@/components/clients/CopyClientTasksDialog';

const ClientTasksSection = ({ clientId, clientName }) => {
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  
  const handleCopySuccess = async () => {
    // Refresh data after successful copy
  };
  
  return (
    <>
      <Button onClick={() => setIsCopyDialogOpen(true)}>
        Copy Tasks
      </Button>
      
      <CopyClientTasksDialog
        open={isCopyDialogOpen}
        onOpenChange={(open) => {
          setIsCopyDialogOpen(open);
          if (!open) {
            handleCopySuccess();
          }
        }}
        defaultSourceClientId={clientId}
        sourceClientName={clientName}
      />
    </>
  );
};
```

## Workflow

The task copying workflow consists of these steps:

1. **Select Target Client**: Choose the client who will receive the tasks
2. **Select Tasks**: Choose which tasks to copy from the source client
3. **Confirmation**: Review and confirm the copy operation
4. **Processing**: Execute the task copying operation
5. **Success**: View results and complete the workflow

## Extension Points

### Adding New Steps

To add a new step to the workflow:

1. Update the `CopyTaskStep` type in `types.ts`
2. Add step handling logic in `useCopyTasksDialog.tsx`
3. Create a new step component
4. Add the step to the `CopyDialogStepRenderer.tsx` switch statement

### Customizing Validation

Validation logic is centralized in the hook files:

- `useCopyTasksDialog.tsx` - Main workflow validation
- `useTaskSelection.tsx` - Task selection validation
- `useCopyDialogState.tsx` - State validation

### Performance Optimization

For large client lists or task sets, use the performance-optimized components:

- `PerformanceOptimizedClientList` - Virtualized client selection
- `PerformanceOptimizedTaskList` - Virtualized task selection

## Troubleshooting

### Common Issues

1. **Empty client list**: Verify that the client service is returning data correctly
2. **Task selection not working**: Check that task IDs are being properly tracked in state
3. **Copy operation fails**: Verify that the task copy service is properly implemented

### Performance Issues

If experiencing performance issues:

1. Enable performance monitoring by adding the hook:
   ```tsx
   const { metrics, startTiming, endTiming } = usePerformanceMonitoring();
   ```

2. Add timing measurements to critical operations:
   ```tsx
   startTiming('operation-name');
   // Operation code
   const duration = endTiming('operation-name');
   console.log(`Operation completed in ${duration}ms`);
   ```

## API Integration

The component relies on these service APIs:

- `clientService.getAllClients()` - Retrieve all available clients
- `taskService.getClientTasks(clientId)` - Retrieve tasks for a specific client
- `taskCopyService.copyClientTasks(options)` - Execute the copy operation

Ensure these services are properly implemented and returning data in the expected format.
