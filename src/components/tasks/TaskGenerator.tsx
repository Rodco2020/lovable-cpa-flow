
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateTaskInstances } from '@/services/taskService';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TaskGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number>(0);
  const { toast } = useToast();

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      const newTasks = await generateTaskInstances();
      
      setGeneratedCount(newTasks.length);
      
      toast({
        title: "Tasks Generated",
        description: `Successfully generated ${newTasks.length} task instances`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error generating tasks:", error);
      
      toast({
        title: "Generation Failed",
        description: "There was an error generating tasks",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 border rounded-lg bg-background">
      <h2 className="text-xl font-bold mb-4">Task Generation</h2>
      <p className="text-muted-foreground mb-6">
        Generate new task instances from active recurring tasks
      </p>
      
      <Button 
        onClick={handleGenerateTasks}
        disabled={isGenerating}
        className="mb-4"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Tasks"
        )}
      </Button>
      
      {generatedCount > 0 && !isGenerating && (
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="mr-1 h-4 w-4" />
          {generatedCount} task{generatedCount !== 1 ? 's' : ''} generated successfully
        </div>
      )}
    </div>
  );
};

export default TaskGenerator;
