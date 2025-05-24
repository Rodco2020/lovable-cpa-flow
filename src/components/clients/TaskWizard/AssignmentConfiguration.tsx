
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, RefreshCw, Settings } from 'lucide-react';
import { TaskTemplate } from '@/types/task';

export interface AssignmentConfig {
  assignmentType: 'ad-hoc' | 'recurring';
  priority?: string;
  dueDate?: Date;
  estimatedHours?: number;
  recurrencePattern?: {
    type: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
    interval?: number;
    weekdays?: number[];
    dayOfMonth?: number;
  };
  customizePerClient: boolean;
}

interface AssignmentConfigurationProps {
  selectedTemplates: TaskTemplate[];
  selectedClientIds: string[];
  config: AssignmentConfig;
  onConfigChange: (config: AssignmentConfig) => void;
}

export const AssignmentConfiguration: React.FC<AssignmentConfigurationProps> = ({
  selectedTemplates,
  selectedClientIds,
  config,
  onConfigChange
}) => {
  const updateConfig = (updates: Partial<AssignmentConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const handleRecurrenceChange = (key: string, value: any) => {
    updateConfig({
      recurrencePattern: {
        ...config.recurrencePattern,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Assignment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Assignment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Templates Selected</p>
              <p className="font-medium">{selectedTemplates.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clients Selected</p>
              <p className="font-medium">{selectedClientIds.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Assignment Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={config.assignmentType === 'ad-hoc' ? 'default' : 'outline'}
              onClick={() => updateConfig({ assignmentType: 'ad-hoc' })}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              One-time Task
            </Button>
            <Button
              variant={config.assignmentType === 'recurring' ? 'default' : 'outline'}
              onClick={() => updateConfig({ assignmentType: 'recurring' })}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recurring Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Task Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Override</Label>
              <Select 
                value={config.priority || ''} 
                onValueChange={(value) => updateConfig({ priority: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Use template default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Use template default</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Estimated Hours Override</Label>
              <Input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                value={config.estimatedHours || ''}
                onChange={(e) => updateConfig({ 
                  estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                placeholder="Use template default"
              />
            </div>
          </div>

          {config.assignmentType === 'ad-hoc' && (
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={config.dueDate ? config.dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => updateConfig({ 
                  dueDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurrence Configuration */}
      {config.assignmentType === 'recurring' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Recurrence Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recurrenceType">Recurrence Pattern</Label>
              <Select 
                value={config.recurrencePattern?.type || 'Monthly'} 
                onValueChange={(value) => handleRecurrenceChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Quarterly">Quarterly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(config.recurrencePattern?.type === 'Daily' || config.recurrencePattern?.type === 'Weekly') && (
              <div className="space-y-2">
                <Label htmlFor="interval">Repeat Every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={config.recurrencePattern?.interval || 1}
                    onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    {config.recurrencePattern?.type === 'Daily' ? 'day(s)' : 'week(s)'}
                  </span>
                </div>
              </div>
            )}

            {config.recurrencePattern?.type === 'Monthly' && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">Day of Month</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  value={config.recurrencePattern?.dayOfMonth || 1}
                  onChange={(e) => handleRecurrenceChange('dayOfMonth', parseInt(e.target.value))}
                  placeholder="1"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Advanced Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="customizePerClient">Customize per client</Label>
              <p className="text-sm text-muted-foreground">
                Allow different settings for each client during assignment
              </p>
            </div>
            <Switch
              id="customizePerClient"
              checked={config.customizePerClient}
              onCheckedChange={(checked) => updateConfig({ customizePerClient: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      {selectedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Selected Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedTemplates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{config.estimatedHours || template.defaultEstimatedHours}h</span>
                      <Badge variant="outline" className="text-xs">
                        {config.priority || template.defaultPriority}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
