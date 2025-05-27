
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Play } from 'lucide-react';
import { TaskTemplate } from '@/types/task';
import { Client } from '@/types/client';
import { AssignmentConfig } from '../../TaskWizard/AssignmentConfiguration';

interface ConfirmationStepProps {
  selectedTemplateIds: string[];
  selectedClientIds: string[];
  assignmentConfig: AssignmentConfig;
  availableTemplates: TaskTemplate[];
  availableClients: Client[];
  onExecute: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedTemplateIds,
  selectedClientIds,
  assignmentConfig,
  availableTemplates,
  availableClients,
  onExecute,
  onBack,
  isProcessing
}) => {
  const selectedTemplates = availableTemplates.filter(t => selectedTemplateIds.includes(t.id));
  const selectedClients = availableClients.filter(c => selectedClientIds.includes(c.id));
  const totalOperations = selectedTemplateIds.length * selectedClientIds.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Confirm Assignment</h3>
        <p className="text-sm text-muted-foreground">
          Review your selection before proceeding
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Templates ({selectedTemplates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.category}</div>
                  </div>
                  <Badge variant="outline">{template.defaultPriority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Clients ({selectedClients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{client.legalName}</div>
                    <div className="text-xs text-muted-foreground">{client.industry}</div>
                  </div>
                  <Badge variant="outline">{client.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Task Type:</span>
              <span className="ml-2 capitalize">{assignmentConfig.taskType}</span>
            </div>
            <div>
              <span className="font-medium">Priority:</span>
              <span className="ml-2">{assignmentConfig.priority}</span>
            </div>
            {assignmentConfig.taskType === 'recurring' && (
              <>
                <div>
                  <span className="font-medium">Recurrence:</span>
                  <span className="ml-2">{assignmentConfig.recurrenceType}</span>
                </div>
                <div>
                  <span className="font-medium">Interval:</span>
                  <span className="ml-2">Every {assignmentConfig.interval}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalOperations}</div>
            <div className="text-sm text-muted-foreground">
              Total assignments to be created
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {selectedTemplateIds.length} templates × {selectedClientIds.length} clients
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing} className="flex items-center space-x-2">
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={onExecute} disabled={isProcessing} className="flex items-center space-x-2">
          <Play className="w-4 h-4" />
          <span>{isProcessing ? 'Processing...' : 'Execute Assignment'}</span>
        </Button>
      </div>
    </div>
  );
};
