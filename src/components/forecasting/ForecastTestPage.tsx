
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runRecurrenceTests, runSkillAllocationTests } from "@/utils/forecastTestingUtils";
import SkillAllocationSelector from "./SkillAllocationSelector";
import { setForecastDebugMode, isForecastDebugModeEnabled } from "@/services/forecasting/debug";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ForecastTestPage: React.FC = () => {
  const [consoleOutput, setConsoleOutput] = React.useState<string[]>([]);
  const [debugMode, setDebugMode] = React.useState(isForecastDebugModeEnabled());

  React.useEffect(() => {
    // Override console.log to capture output
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog(...args);
      setConsoleOutput(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')]);
    };

    // Restore original console.log on unmount
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  const runTests = (testType: 'recurrence' | 'allocation') => {
    setConsoleOutput([`Running ${testType} tests...`]);
    
    if (testType === 'recurrence') {
      runRecurrenceTests();
    } else {
      runSkillAllocationTests();
    }
  };

  const clearOutput = () => {
    setConsoleOutput([]);
  };

  const handleDebugModeChange = (checked: boolean) => {
    setDebugMode(checked);
    setForecastDebugMode(checked);
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Forecasting Module Tests</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>
                Run tests and view results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="debug-mode" 
                  checked={debugMode} 
                  onCheckedChange={handleDebugModeChange} 
                />
                <Label htmlFor="debug-mode">Debug Mode</Label>
              </div>
              
              <SkillAllocationSelector />
              
              <div className="pt-4 space-y-2">
                <Button onClick={() => runTests('recurrence')} className="w-full">
                  Run Recurrence Tests
                </Button>
                <Button onClick={() => runTests('allocation')} className="w-full">
                  Run Allocation Strategy Tests
                </Button>
                <Button variant="outline" onClick={clearOutput} className="w-full">
                  Clear Output
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Test Output</CardTitle>
              <CardDescription>
                Console output from test runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-muted/20">
                {consoleOutput.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">
                    Run a test to see output
                  </div>
                ) : (
                  <pre className="text-sm font-mono">
                    {consoleOutput.map((line, i) => (
                      <div key={i} className="py-1">{line}</div>
                    ))}
                  </pre>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForecastTestPage;
