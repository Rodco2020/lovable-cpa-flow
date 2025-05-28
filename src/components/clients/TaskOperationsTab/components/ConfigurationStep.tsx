
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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

  const handleFirstDueDateChange = (date: Date | undefined) => {
    updateConfig({ dueDate: date });
  };

  // Helper to determine if day of month field should be shown
  const shouldShowDayOfMonth = () => {
    return assignmentConfig.taskType === 'recurring' && 
           (assignmentConfig.recurrenceType === 'Monthly' || 
            assignmentConfig.recurrenceType === 'Quarterly' || 
            assignmentConfig.recurrenceType === 'Annually');
  };

  // Helper to determine if first due date field should be shown
  const shouldShowFirstDueDate = () => {
    return assignmentConfig.taskType === 'recurring';
  };

  // Validation helper
  const canProceed = () => {
    if (assignmentConfig.taskType === 'recurring') {
      // Check if day of month is required and provided
      if (shouldShowDayOfMonth() && !assignmentConfig.dayOfMonth) {
        return false;
      }
    }
    return true;
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

              {/* Day of Month field - shown for Monthly, Quarterly, and Annually */}
              {shouldShowDayOfMonth() && (
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Day of Month</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={assignmentConfig.dayOfMonth || ''}
                    onChange={(e) => updateConfig({ dayOfMonth: parseInt(e.target.value) || undefined })}
                    placeholder="Enter day (1-31)"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Day of the month when the task should recur (1-31)
                  </p>
                </div>
              )}

              {/* First Due Date field - shown for all recurring tasks */}
              {shouldShowFirstDueDate() && (
                <div className="space-y-2">
                  <Label htmlFor="firstDueDate">First Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !assignmentConfig.dueDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {assignmentConfig.dueDate ? (
                          format(assignmentConfig.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={assignmentConfig.dueDate}
                        onSelect={handleFirstDueDateChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    When should the first instance of this recurring task be due?
                  </p>
                </div>
              )}
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
        <Button 
          onClick={onNext} 
          disabled={!canProceed()}
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
