
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  Users, 
  Clock, 
  Star,
  Tag,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Client } from '@/types/client';
import { TaskInstance, RecurringTask, TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';

interface TaskWithClient {
  task: TaskInstance | RecurringTask;
  client: Client;
}

interface ConversionAnalysis {
  suggestedName: string;
  suggestedDescription: string;
  averageHours: number;
  mostCommonPriority: TaskPriority;
  mostCommonCategory: TaskCategory;
  requiredSkills: string[];
  clientsUsingTasks: string[];
  varianceAnalysis: {
    hoursVariance: number;
    priorityConsistency: number;
    categoryConsistency: number;
  };
}

interface TaskToTemplateConverterProps {
  selectedTasks: TaskWithClient[];
  onConversionComplete: (templateData: Partial<TaskTemplate>) => void;
}

export const TaskToTemplateConverter: React.FC<TaskToTemplateConverterProps> = ({
  selectedTasks,
  onConversionComplete
}) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Analyze selected tasks to suggest template properties
  const analysis = useMemo((): ConversionAnalysis => {
    if (selectedTasks.length === 0) {
      return {
        suggestedName: '',
        suggestedDescription: '',
        averageHours: 0,
        mostCommonPriority: 'Medium',
        mostCommonCategory: 'Other',
        requiredSkills: [],
        clientsUsingTasks: [],
        varianceAnalysis: {
          hoursVariance: 0,
          priorityConsistency: 0,
          categoryConsistency: 0
        }
      };
    }

    const tasks = selectedTasks.map(item => item.task);
    const clients = selectedTasks.map(item => item.client);

    // Calculate average hours
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const averageHours = Math.round(totalHours / tasks.length * 100) / 100;

    // Find most common priority
    const priorityCount = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>);
    const mostCommonPriority = Object.entries(priorityCount).reduce((a, b) => 
      priorityCount[a[0] as TaskPriority] > priorityCount[b[0] as TaskPriority] ? a : b
    )[0] as TaskPriority;

    // Find most common category
    const categoryCount = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<TaskCategory, number>);
    const mostCommonCategory = Object.entries(categoryCount).reduce((a, b) => 
      categoryCount[a[0] as TaskCategory] > categoryCount[b[0] as TaskCategory] ? a : b
    )[0] as TaskCategory;

    // Collect all required skills
    const allSkills = tasks.flatMap(task => task.requiredSkills);
    const skillCount = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const requiredSkills = Object.entries(skillCount)
      .filter(([_, count]) => count >= Math.ceil(tasks.length * 0.5)) // Skills used in at least 50% of tasks
      .map(([skill]) => skill);

    // Get unique client names
    const clientsUsingTasks = [...new Set(clients.map(client => client.legalName))];

    // Calculate variance analysis
    const hours = tasks.map(task => task.estimatedHours);
    const hoursVariance = hours.reduce((acc, h) => acc + Math.pow(h - averageHours, 2), 0) / hours.length;
    const priorityConsistency = (priorityCount[mostCommonPriority] / tasks.length) * 100;
    const categoryConsistency = (categoryCount[mostCommonCategory] / tasks.length) * 100;

    // Suggest name and description
    const commonWords = tasks.map(task => task.name.toLowerCase())
      .join(' ')
      .split(' ')
      .filter(word => word.length > 3)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topWords = Object.entries(commonWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);

    const suggestedName = topWords.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || `${mostCommonCategory} Template`;

    const suggestedDescription = `Template based on ${tasks.length} tasks from ${clientsUsingTasks.length} client${clientsUsingTasks.length !== 1 ? 's' : ''}. Average duration: ${averageHours} hours.`;

    return {
      suggestedName,
      suggestedDescription,
      averageHours,
      mostCommonPriority,
      mostCommonCategory,
      requiredSkills,
      clientsUsingTasks,
      varianceAnalysis: {
        hoursVariance: Math.round(hoursVariance * 100) / 100,
        priorityConsistency: Math.round(priorityConsistency),
        categoryConsistency: Math.round(categoryConsistency)
      }
    };
  }, [selectedTasks]);

  // Auto-populate suggested values when analysis changes
  React.useEffect(() => {
    setTemplateName(analysis.suggestedName);
    setTemplateDescription(analysis.suggestedDescription);
  }, [analysis.suggestedName, analysis.suggestedDescription]);

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      const templateData: Partial<TaskTemplate> = {
        name: templateName || analysis.suggestedName,
        description: templateDescription || analysis.suggestedDescription,
        defaultEstimatedHours: analysis.averageHours,
        requiredSkills: analysis.requiredSkills,
        defaultPriority: analysis.mostCommonPriority,
        category: analysis.mostCommonCategory,
      };

      // Simulate conversion processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onConversionComplete(templateData);
    } finally {
      setIsConverting(false);
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance < 1) return 'text-green-600';
    if (variance < 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConsistencyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Task Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{selectedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis.clientsUsingTasks.length}</div>
              <div className="text-sm text-muted-foreground">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis.averageHours}h</div>
              <div className="text-sm text-muted-foreground">Avg Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analysis.requiredSkills.length}</div>
              <div className="text-sm text-muted-foreground">Common Skills</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Hours Variance:</span>
              <span className={`text-sm ${getVarianceColor(analysis.varianceAnalysis.hoursVariance)}`}>
                ±{analysis.varianceAnalysis.hoursVariance}h
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Priority Consistency:</span>
              <span className={`text-sm ${getConsistencyColor(analysis.varianceAnalysis.priorityConsistency)}`}>
                {analysis.varianceAnalysis.priorityConsistency}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Category Consistency:</span>
              <span className={`text-sm ${getConsistencyColor(analysis.varianceAnalysis.categoryConsistency)}`}>
                {analysis.varianceAnalysis.categoryConsistency}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Template Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Template Name</label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={analysis.suggestedName}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder={analysis.suggestedDescription}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Default Hours</label>
              <div className="p-2 border rounded bg-muted text-center">
                {analysis.averageHours}h
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="p-2 border rounded bg-muted text-center">
                <Badge variant="outline">{analysis.mostCommonCategory}</Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {analysis.requiredSkills.length > 0 ? (
                analysis.requiredSkills.map(skill => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No common skills identified</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Default Priority</label>
            <div className="p-2 border rounded bg-muted text-center">
              <Badge variant="outline">{analysis.mostCommonPriority}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleConvert}
          disabled={!templateName.trim() || isConverting}
          className="flex items-center"
        >
          {isConverting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Converting...
            </>
          ) : (
            <>
              Convert to Template
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
