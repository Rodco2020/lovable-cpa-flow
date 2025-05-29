
import React, { useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileCheck, 
  Copy, 
  BarChart3, 
  Settings,
  Users,
  Calendar
} from 'lucide-react';
import { TemplateAssignmentTab } from './TaskOperationsTab/TemplateAssignmentTab';
import { CopyTasksTab } from './TaskOperationsTab/CopyTasksTab';
import { useDialogState } from './TaskOperationsTab/hooks/useDialogState';
import { useOperationProgress } from './TaskOperationsTab/hooks/useOperationProgress';

interface ClientTaskManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksRefresh?: () => void;
  initialClientId?: string;
}

/**
 * Main dialog for managing client tasks across the practice
 * Phase 2: Unified state management and progress tracking
 */
const ClientTaskManagementDialog: React.FC<ClientTaskManagementDialogProps> = ({
  open,
  onOpenChange,
  onTasksRefresh,
  initialClientId
}) => {
  const { state: dialogState, setActiveTab, resetDialogState } = useDialogState();
  const { progressState, resetProgress } = useOperationProgress();

  // Handle dialog close with proper cleanup
  const handleClose = useCallback(() => {
    // Reset all state when dialog closes
    resetDialogState();
    resetProgress();
    onOpenChange(false);
  }, [resetDialogState, resetProgress, onOpenChange]);

  // Handle dialog open/close state changes
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      handleClose();
    } else {
      onOpenChange(open);
    }
  }, [handleClose, onOpenChange]);

  // Handle tab changes with state cleanup
  const handleTabChange = useCallback((value: string) => {
    // Reset progress when switching tabs (unless currently processing)
    if (!progressState.isProcessing) {
      resetProgress();
    }
    setActiveTab(value as any);
  }, [setActiveTab, resetProgress, progressState.isProcessing]);

  // Handle successful task operations
  const handleTaskOperationSuccess = useCallback(() => {
    // Call the refresh callback when tasks are successfully created or copied
    if (onTasksRefresh) {
      console.log('Task operation completed successfully, triggering refresh');
      onTasksRefresh();
    }
  }, [onTasksRefresh]);

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      resetDialogState();
      resetProgress();
    }
  }, [open, resetDialogState, resetProgress]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Tasks
            {progressState.isProcessing && (
              <Badge variant="secondary" className="ml-2">
                Processing...
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs 
            value={dialogState.activeTab} 
            onValueChange={handleTabChange} 
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger 
                value="templates" 
                className="flex items-center gap-2"
                disabled={progressState.isProcessing}
              >
                <FileCheck className="h-4 w-4" />
                From Templates
              </TabsTrigger>
              <TabsTrigger 
                value="copy" 
                className="flex items-center gap-2"
                disabled={progressState.isProcessing}
              >
                <Copy className="h-4 w-4" />
                Copy Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="flex items-center gap-2"
                disabled={progressState.isProcessing}
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger 
                value="bulk" 
                className="flex items-center gap-2"
                disabled={progressState.isProcessing}
              >
                <Users className="h-4 w-4" />
                Bulk Operations
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 overflow-auto">
              <TabsContent value="templates" className="h-full">
                <TemplateAssignmentTab 
                  onClose={handleClose}
                  onTasksRefresh={handleTaskOperationSuccess}
                />
              </TabsContent>

              <TabsContent value="copy" className="h-full">
                <CopyTasksTab 
                  initialClientId={initialClientId}
                  onClose={handleClose}
                  onTasksRefresh={handleTaskOperationSuccess}
                />
              </TabsContent>

              <TabsContent value="reports" className="h-full">
                <ReportsTab />
              </TabsContent>

              <TabsContent value="bulk" className="h-full">
                <BulkOperationsTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Reports Tab - Phase 1 placeholder
 */
const ReportsTab: React.FC = () => {
  return (
    <div className="p-6 text-center">
      <div className="max-w-md mx-auto">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Task Analytics & Reports</h3>
        <p className="text-muted-foreground mb-4">
          View comprehensive reports on task distribution, workload analysis, and performance metrics.
        </p>
        <Badge variant="outline" className="mb-2">
          Coming in Phase 4
        </Badge>
      </div>
    </div>
  );
};

/**
 * Bulk Operations Tab - Phase 1 placeholder
 */
const BulkOperationsTab: React.FC = () => {
  return (
    <div className="p-6 text-center">
      <div className="max-w-md mx-auto">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Bulk Task Operations</h3>
        <p className="text-muted-foreground mb-4">
          Perform bulk operations like status updates, reassignments, and batch modifications across multiple tasks.
        </p>
        <Badge variant="outline" className="mb-2">
          Coming in Phase 5
        </Badge>
      </div>
    </div>
  );
};

export default ClientTaskManagementDialog;
