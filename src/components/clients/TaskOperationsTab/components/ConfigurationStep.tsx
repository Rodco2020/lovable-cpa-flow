
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AssignmentConfig } from '../../TaskWizard/AssignmentConfiguration';

interface ConfigurationStepProps {
  assignmentConfig: AssignmentConfig;
  setAssignmentConfig: (config: AssignmentConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  assignmentConfig,
  setAssignmentConfig,
  onNext,
  onBack
}) => {
  const updateConfig = (updates: Partial<AssignmentConfig>) => {
    setAssignmentConfig({ ...assignmentConfig, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Configure Assignment</h3>
        <p className="text-sm text-muted-foreground">
          Set up how tasks should be assigned to clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select
                value={assignmentConfig.taskType}
                onValueChange={(value: 'adhoc' | 'recurring') => 
                  updateConfig({ taskType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adhoc">Ad-hoc Tasks</SelectItem>
                  <SelectItem value="recurring">Recurring Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Default Priority</Label>
              <Select
                value={assignmentConfig.priority}
                onValueChange={(value: 'Low' | 'Medium' | 'High' | 'Urgent') => 
                  updateConfig({ priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {assignmentConfig.taskType === 'recurring' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recurrenceType">Recurrence Type</Label>
                  <Select
                    value={assignmentConfig.recurrenceType}
                    onValueChange={(value: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually') => 
                      updateConfig({ recurrenceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recurrence" />
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

                <div className="space-y-2">
                  <Label htmlFor="interval">Interval</Label>
                  <Select
                    value={assignmentConfig.interval?.toString()}
                    onValueChange={(value) => 
                      updateConfig({ interval: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          Every {num} {assignmentConfig.recurrenceType?.toLowerCase()}(s)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserveEstimatedHours"
                checked={assignmentConfig.preserveEstimatedHours}
                onCheckedChange={(checked) => 
                  updateConfig({ preserveEstimatedHours: !!checked })
                }
              />
              <Label htmlFor="preserveEstimatedHours">
                Preserve template estimated hours
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserveSkills"
                checked={assignmentConfig.preserveSkills}
                onCheckedChange={(checked) => 
                  updateConfig({ preserveSkills: !!checked })
                }
              />
              <Label htmlFor="preserveSkills">
                Preserve template required skills
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="generateImmediately"
                checked={assignmentConfig.generateImmediately}
                onCheckedChange={(checked) => 
                  updateConfig({ generateImmediately: !!checked })
                }
              />
              <Label htmlFor="generateImmediately">
                Generate task instances immediately
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button onClick={onNext} className="flex items-center space-x-2">
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
