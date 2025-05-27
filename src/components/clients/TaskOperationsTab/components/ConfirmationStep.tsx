
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface ConfirmationStepProps {
  selectedTemplateIds: string[];
  selectedClientIds: string[];
  assignmentConfig: any;
  availableTemplates: any[];
  availableClients: any[];
  onBack: () => void;
  onExecute: () => void;
}

/**
 * ConfirmationStep Component
 * 
 * Third step of the template assignment wizard.
 * Shows a summary of selections and configuration before execution.
 */
export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedTemplateIds,
  selectedClientIds,
  assignmentConfig,
  availableTemplates,
  availableClients,
  onBack,
  onExecute
}) => {
  const selectedTemplates = availableTemplates.filter(t => selectedTemplateIds.includes(t.id));
  const selectedClients = availableClients.filter(c => selectedClientIds.includes(c.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Templates ({selectedTemplates.length})</h4>
            <div className="space-y-1">
              {selectedTemplates.map(template => (
                <div key={template.id} className="text-sm text-muted-foreground">
                  • {template.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Clients ({selectedClients.length})</h4>
            <div className="space-y-1">
              {selectedClients.map(client => (
                <div key={client.id} className="text-sm text-muted-foreground">
                  • {client.legalName}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Configuration</h4>
            <div className="text-sm text-muted-foreground">
              <div>• Assignment Type: {assignmentConfig.assignmentType}</div>
              {assignmentConfig.priority && <div>• Priority: {assignmentConfig.priority}</div>}
              {assignmentConfig.dueDate && <div>• Due Date: {assignmentConfig.dueDate.toDateString()}</div>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Configuration
        </Button>
        <Button onClick={onExecute} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Execute Assignment
        </Button>
      </div>
    </div>
  );
};
