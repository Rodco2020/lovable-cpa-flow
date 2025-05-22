
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import ForecastInfoTooltip from '../ForecastInfoTooltip';

interface DebugTabProps {
  debugMode: boolean;
  handleToggleDebugMode: () => void;
  handleRunTests: () => void;
  handleValidateSystem: () => void;
  validationIssues: string[];
}

const DebugTab: React.FC<DebugTabProps> = ({
  debugMode,
  handleToggleDebugMode,
  handleRunTests,
  handleValidateSystem,
  validationIssues
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Forecast Calculation Debug</CardTitle>
          <CardDescription>
            Tools to help diagnose and validate forecast calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="debug-mode" 
              checked={debugMode} 
              onCheckedChange={handleToggleDebugMode} 
            />
            <Label htmlFor="debug-mode">Enable Debug Mode</Label>
            <ForecastInfoTooltip
              title="Debug Mode"
              content="When enabled, detailed calculation logs will be printed to the browser console, showing each step of the forecast calculation process."
            />
          </div>
          <p className="text-sm text-muted-foreground">
            When debug mode is enabled, detailed calculation logs will be shown in the browser console.
          </p>
          
          <div className="pt-4 space-y-2">
            <Button onClick={handleRunTests} className="mr-2">
              Run Test Cases
            </Button>
            <Button onClick={handleValidateSystem} variant="outline">
              Validate System
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              Executes test cases for various recurrence patterns, or validates the entire forecast system.
              Results will be shown in the browser console.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={validationIssues.length > 0 ? "border-amber-500" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validationIssues.length > 0 && (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            Validation Results
          </CardTitle>
          <CardDescription>
            {validationIssues.length === 0 
              ? "Run validation to check for potential issues" 
              : `${validationIssues.length} issues found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No validation issues detected.
            </p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              <ul className="list-disc pl-5 space-y-1">
                {validationIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-amber-700 dark:text-amber-500">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugTab;
