
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoScheduleConfig } from "@/services/autoSchedulerService";
import { Sliders, Play, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AutoScheduleConfigPanelProps {
  onSchedule: (config: AutoScheduleConfig) => void;
  isScheduling: boolean;
}

const AutoScheduleConfigPanel: React.FC<AutoScheduleConfigPanelProps> = ({
  onSchedule,
  isScheduling
}) => {
  const [config, setConfig] = useState<AutoScheduleConfig>({
    lookAheadDays: 14,
    maxTasksPerBatch: 20,
    balanceWorkload: true,
    respectPriority: true,
    respectDueDate: true,
    respectSkillMatch: true
  });
  
  const [expanded, setExpanded] = useState(false);
  
  const handleChange = (key: keyof AutoScheduleConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleNumberChange = (key: keyof AutoScheduleConfig, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      handleChange(key, numValue);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Sliders className="mr-2 h-5 w-5" /> Auto-Scheduling Configuration
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Hide Options' : 'Show Options'}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800 text-sm">
              Configure how the automatic scheduler prioritizes and assigns tasks to staff members.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="lookAheadDays">Look Ahead Days</Label>
              <Input
                id="lookAheadDays"
                type="number"
                min="1"
                max="60"
                value={config.lookAheadDays}
                onChange={(e) => handleNumberChange('lookAheadDays', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Number of days in the future to consider for scheduling
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxTasksPerBatch">Maximum Tasks Per Batch</Label>
              <Input
                id="maxTasksPerBatch"
                type="number"
                min="1"
                max="100"
                value={config.maxTasksPerBatch}
                onChange={(e) => handleNumberChange('maxTasksPerBatch', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of tasks to schedule in one batch
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="balanceWorkload" className="text-sm font-medium">
                  Balance Workload
                </Label>
                <p className="text-xs text-muted-foreground">
                  Distribute work evenly among staff
                </p>
              </div>
              <Switch
                id="balanceWorkload"
                checked={config.balanceWorkload}
                onCheckedChange={(checked) => handleChange('balanceWorkload', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="respectPriority" className="text-sm font-medium">
                  Respect Task Priority
                </Label>
                <p className="text-xs text-muted-foreground">
                  Schedule higher priority tasks first
                </p>
              </div>
              <Switch
                id="respectPriority"
                checked={config.respectPriority}
                onCheckedChange={(checked) => handleChange('respectPriority', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="respectDueDate" className="text-sm font-medium">
                  Respect Due Dates
                </Label>
                <p className="text-xs text-muted-foreground">
                  Prioritize tasks with approaching deadlines
                </p>
              </div>
              <Switch
                id="respectDueDate"
                checked={config.respectDueDate}
                onCheckedChange={(checked) => handleChange('respectDueDate', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="respectSkillMatch" className="text-sm font-medium">
                  Optimize Skill Matching
                </Label>
                <p className="text-xs text-muted-foreground">
                  Prioritize staff with best skill match for each task
                </p>
              </div>
              <Switch
                id="respectSkillMatch"
                checked={config.respectSkillMatch}
                onCheckedChange={(checked) => handleChange('respectSkillMatch', checked)}
              />
            </div>
          </div>
        </CardContent>
      )}
      
      <CardFooter className="pt-3">
        <Button 
          onClick={() => onSchedule(config)} 
          disabled={isScheduling}
          className="w-full"
        >
          {isScheduling ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scheduling...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> 
              Run Auto-Scheduler
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AutoScheduleConfigPanel;
