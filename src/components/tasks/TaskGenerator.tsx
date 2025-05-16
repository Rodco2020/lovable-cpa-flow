
import React, { useState } from 'react';
import { generateTaskInstances } from '@/services/taskService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TaskGenerator: React.FC = () => {
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Validate dates
      if (from > to) {
        toast.error("The 'From' date must be before the 'To' date.");
        setError("Invalid date range: 'From' date must be before 'To' date.");
        setIsGenerating(false);
        return;
      }
      
      // Generate tasks with progress feedback
      toast.loading("Generating tasks...");
      
      const newTasks = await generateTaskInstances(from, to, leadTimeDays);
      
      toast.dismiss();
      toast.success(`Successfully generated ${newTasks.length} new tasks.`);
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while generating tasks.");
      console.error("Task generation error:", error);
      setError("Failed to generate tasks. Please check the console for details.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Tasks</CardTitle>
        <CardDescription>
          Generate task instances from recurring task templates for the specified date range.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="fromDate" className="text-sm font-medium">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="toDate" className="text-sm font-medium">
              To Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="leadTimeDays" className="text-sm font-medium">
              Lead Time (Days)
            </label>
            <Input
              id="leadTimeDays"
              type="number"
              min="0"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="relative"
          >
            {isGenerating ? (
              <>
                <span className="opacity-0">Generate Tasks</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                </span>
              </>
            ) : (
              <>
                Generate Tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskGenerator;
