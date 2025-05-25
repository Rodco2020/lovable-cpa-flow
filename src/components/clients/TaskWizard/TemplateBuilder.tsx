
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Settings, 
  Eye, 
  CheckCircle,
  Building2,
  Clock,
  User,
  Tag
} from 'lucide-react';
import { Client } from '@/types/client';
import { TaskInstance, RecurringTask } from '@/types/task';
import { TaskToTemplateConverter } from './TaskToTemplateConverter';
import { TemplateCustomizer } from './TemplateCustomizer';
import { TemplateValidator } from './TemplateValidator';

interface TaskWithClient {
  task: TaskInstance | RecurringTask;
  client: Client;
}

interface TemplateBuilderProps {
  selectedTasks: TaskWithClient[];
  onTemplateCreated: (templateData: any) => void;
  onCancel: () => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  selectedTasks,
  onTemplateCreated,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('converter');
  const [convertedTemplate, setConvertedTemplate] = useState<any>(null);
  const [customizedTemplate, setCustomizedTemplate] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<any>(null);

  const handleConversionComplete = (templateData: any) => {
    setConvertedTemplate(templateData);
    setCustomizedTemplate(templateData);
    setActiveTab('customizer');
  };

  const handleCustomizationComplete = (templateData: any) => {
    setCustomizedTemplate(templateData);
    setActiveTab('validator');
  };

  const handleValidationComplete = (results: any) => {
    setValidationResults(results);
    if (results.isValid) {
      onTemplateCreated(customizedTemplate);
    }
  };

  const getTabStatus = (tab: string) => {
    switch (tab) {
      case 'converter':
        return convertedTemplate ? 'complete' : 'current';
      case 'customizer':
        return customizedTemplate ? 'complete' : convertedTemplate ? 'current' : 'pending';
      case 'validator':
        return validationResults ? 'complete' : customizedTemplate ? 'current' : 'pending';
      default:
        return 'pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Builder</h2>
          <p className="text-muted-foreground">
            Create new templates from {selectedTasks.length} selected task{selectedTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Selected Tasks Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Selected Tasks
            <Badge variant="secondary" className="ml-2">
              {selectedTasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {selectedTasks.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <div>
                      <span className="font-medium">{item.task.name}</span>
                      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {item.client.legalName}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.task.estimatedHours}h
                        </div>
                        <div className="flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {item.task.category}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{item.task.priority}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Template Builder Workflow */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="converter" className="flex items-center space-x-2">
                {getStatusIcon(getTabStatus('converter'))}
                <span>Convert</span>
              </TabsTrigger>
              <TabsTrigger 
                value="customizer" 
                className="flex items-center space-x-2"
                disabled={!convertedTemplate}
              >
                {getStatusIcon(getTabStatus('customizer'))}
                <span>Customize</span>
              </TabsTrigger>
              <TabsTrigger 
                value="validator" 
                className="flex items-center space-x-2"
                disabled={!customizedTemplate}
              >
                {getStatusIcon(getTabStatus('validator'))}
                <span>Validate</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="converter" className="p-6">
              <TaskToTemplateConverter
                selectedTasks={selectedTasks}
                onConversionComplete={handleConversionComplete}
              />
            </TabsContent>

            <TabsContent value="customizer" className="p-6">
              {convertedTemplate && (
                <TemplateCustomizer
                  initialTemplate={convertedTemplate}
                  onCustomizationComplete={handleCustomizationComplete}
                />
              )}
            </TabsContent>

            <TabsContent value="validator" className="p-6">
              {customizedTemplate && (
                <TemplateValidator
                  template={customizedTemplate}
                  onValidationComplete={handleValidationComplete}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
