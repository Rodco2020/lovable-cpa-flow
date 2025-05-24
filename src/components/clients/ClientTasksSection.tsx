import React, { useState } from 'react';
import { Copy, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientAdHocTaskList from './ClientAdHocTaskList';
import ClientRecurringTaskList from './ClientRecurringTaskList';
import CopyClientTasksDialog from './CopyClientTasksDialog';
import { TaskAssignmentWizard } from './TaskWizard/TaskAssignmentWizard';

interface ClientTasksSectionProps {
  clientId: string;
  clientName: string;
  onRefreshClient: () => Promise<void>;
}

/**
 * Component that handles displaying and managing client tasks
 */
const ClientTasksSection: React.FC<ClientTasksSectionProps> = ({ 
  clientId, 
  clientName,
  onRefreshClient 
}) => {
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Client Tasks</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCopyDialogOpen(true)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Tasks
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setIsWizardOpen(true)}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Task Wizard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="adhoc" className="space-y-4">
        <TabsList>
          <TabsTrigger value="adhoc">Ad-hoc Tasks</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="adhoc">
          <ClientAdHocTaskList 
            clientId={clientId} 
            onTasksChanged={onRefreshClient} 
          />
        </TabsContent>
        
        <TabsContent value="recurring">
          <ClientRecurringTaskList 
            clientId={clientId}
            onRefreshNeeded={onRefreshClient}
          />
        </TabsContent>
      </Tabs>
      
      {/* Existing Copy Dialog - unchanged functionality */}
      <CopyClientTasksDialog 
        open={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        clientId={clientId}
        sourceClientName={clientName}
      />
      
      {/* New Task Assignment Wizard */}
      <TaskAssignmentWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        initialClientId={clientId}
      />
    </div>
  );
};

export default ClientTasksSection;
