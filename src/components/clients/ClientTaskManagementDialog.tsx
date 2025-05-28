
import React, { useState } from 'react';
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

interface ClientTaskManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTasksRefresh?: () => void;
}

/**
 * Main dialog for managing client tasks across the practice
 * Phase 2: Integrated template assignment functionality
 */
const ClientTaskManagementDialog: React.FC<ClientTaskManagementDialogProps> = ({
  open,
  onOpenChange,
  onTasksRefresh
}) => {
  const [activeTab, setActiveTab] = useState('templates');

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleTaskOperationSuccess = () => {
    // Call the refresh callback when tasks are successfully created
    if (onTasksRefresh) {
      onTasksRefresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Tasks
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                From Templates
              </TabsTrigger>
              <TabsTrigger value="copy" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy Tasks
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
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
                <CopyTasksTab />
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
 * Copy Tasks Tab - Phase 1 placeholder
 */
const CopyTasksTab: React.FC = () => {
  return (
    <div className="p-6 text-center">
      <div className="max-w-md mx-auto">
        <Copy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Copy Tasks Between Clients</h3>
        <p className="text-muted-foreground mb-4">
          Copy existing tasks from one client to another with bulk selection and customization options.
        </p>
        <Badge variant="outline" className="mb-2">
          Coming in Phase 3
        </Badge>
      </div>
    </div>
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
