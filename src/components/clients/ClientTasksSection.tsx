
import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientAdHocTaskList from './ClientAdHocTaskList';
import ClientRecurringTaskList from './ClientRecurringTaskList';
import CopyClientTasksDialog from './CopyClientTasksDialog';

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
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Client Tasks</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsCopyDialogOpen(true)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Tasks
        </Button>
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
      
      <CopyClientTasksDialog 
        open={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        clientId={clientId}
        sourceClientName={clientName}
      />
    </div>
  );
};

export default ClientTasksSection;
