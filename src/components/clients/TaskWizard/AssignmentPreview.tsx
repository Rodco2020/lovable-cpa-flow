
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Clock, Users, Calendar, RefreshCw } from 'lucide-react';
import { TaskTemplate } from '@/types/task';
import { Client } from '@/types/client';
import { AssignmentConfig } from './AssignmentConfiguration';

interface AssignmentPreviewProps {
  selectedTemplates: TaskTemplate[];
  selectedClients: Client[];
  config: AssignmentConfig;
  isVisible: boolean;
}

export const AssignmentPreview: React.FC<AssignmentPreviewProps> = ({
  selectedTemplates,
  selectedClients,
  config,
  isVisible
}) => {
  if (!isVisible) return null;

  const totalTasks = selectedTemplates.length * selectedClients.length;
  const totalEstimatedHours = selectedTemplates.reduce((sum, template) => 
    sum + (config.estimatedHours || template.defaultEstimatedHours), 0
  ) * selectedClients.length;

  const getRecurrenceDescription = () => {
    if (config.assignmentType !== 'recurring' || !config.recurrencePattern) return null;
    
    const { type, interval, dayOfMonth } = config.recurrencePattern;
    
    switch (type) {
      case 'Daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;
      case 'Weekly':
        return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      case 'Monthly':
        return `Monthly on day ${dayOfMonth || 1}`;
      case 'Quarterly':
        return 'Quarterly';
      case 'Annually':
        return 'Annually';
      default:
        return type;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          Assignment Preview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Tasks to Create</p>
            <p className="text-2xl font-bold text-primary">{totalTasks}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Estimated Hours</p>
            <p className="text-2xl font-bold text-primary">{totalEstimatedHours}h</p>
          </div>
        </div>

        {/* Assignment Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {config.assignmentType === 'recurring' ? (
              <RefreshCw className="h-4 w-4 text-muted-foreground mr-2" />
            ) : (
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            )}
            <span className="text-sm">Assignment Type</span>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant={config.assignmentType === 'recurring' ? 'default' : 'secondary'}>
              {config.assignmentType === 'recurring' ? 'Recurring' : 'One-time'}
            </Badge>
            {config.assignmentType === 'recurring' && (
              <span className="text-xs text-muted-foreground mt-1">
                {getRecurrenceDescription()}
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Templates Section */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Templates ({selectedTemplates.length})
          </h4>
          <div className="space-y-2">
            {selectedTemplates.map(template => (
              <div key={template.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{template.name}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{config.estimatedHours || template.defaultEstimatedHours}h</span>
                    <Badge variant="outline" className="text-xs">
                      {config.priority || template.defaultPriority}
                    </Badge>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Clients Section */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Clients ({selectedClients.length})
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedClients.map(client => (
              <div key={client.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <span className="font-medium">{client.legalName}</span>
                <Badge variant="outline" className="text-xs">
                  {client.industry}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Configuration Summary */}
        <div className="space-y-2">
          <h4 className="font-medium">Configuration Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {config.priority && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority Override:</span>
                <Badge variant="outline" className="text-xs">{config.priority}</Badge>
              </div>
            )}
            {config.estimatedHours && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hours Override:</span>
                <span>{config.estimatedHours}h</span>
              </div>
            )}
            {config.dueDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{config.dueDate.toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customize per Client:</span>
              <span>{config.customizePerClient ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Important Notes */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Assignment Notes:</p>
              <ul className="text-amber-700 space-y-1 text-xs">
                <li>• All tasks will be created as "Unscheduled"</li>
                <li>• Templates will be applied to each selected client</li>
                <li>• Configuration overrides will be applied consistently</li>
                {config.assignmentType === 'recurring' && (
                  <li>• Recurring tasks will generate instances automatically</li>
                )}
                {config.customizePerClient && (
                  <li>• Custom settings can be adjusted per client after creation</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
