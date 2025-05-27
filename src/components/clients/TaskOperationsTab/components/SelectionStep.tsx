
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { TaskTemplate } from '@/types/task';
import { Client } from '@/types/client';

interface SelectionStepProps {
  selectedTemplateIds: string[];
  setSelectedTemplateIds: (ids: string[]) => void;
  availableTemplates: TaskTemplate[];
  isTemplatesLoading: boolean;
  selectedClientIds: string[];
  setSelectedClientIds: (ids: string[]) => void;
  availableClients: Client[];
  isClientsLoading: boolean;
  onNext: () => void;
  canGoNext: boolean;
}

export const SelectionStep: React.FC<SelectionStepProps> = ({
  selectedTemplateIds,
  setSelectedTemplateIds,
  availableTemplates,
  isTemplatesLoading,
  selectedClientIds,
  setSelectedClientIds,
  availableClients,
  isClientsLoading,
  onNext,
  canGoNext
}) => {
  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplateIds(
      selectedTemplateIds.includes(templateId)
        ? selectedTemplateIds.filter(id => id !== templateId)
        : [...selectedTemplateIds, templateId]
    );
  };

  const handleClientToggle = (clientId: string) => {
    setSelectedClientIds(
      selectedClientIds.includes(clientId)
        ? selectedClientIds.filter(id => id !== clientId)
        : [...selectedClientIds, clientId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Select Templates and Clients</h3>
        <p className="text-sm text-muted-foreground">
          Choose the task templates and clients for bulk assignment
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">
            Templates ({selectedTemplateIds.length} selected)
          </TabsTrigger>
          <TabsTrigger value="clients">
            Clients ({selectedClientIds.length} selected)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {isTemplatesLoading ? (
                <div className="text-center py-4">Loading templates...</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedTemplateIds.includes(template.id)}
                        onCheckedChange={() => handleTemplateToggle(template.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge variant="outline">{template.defaultPriority}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.defaultEstimatedHours}h
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Clients</CardTitle>
            </CardHeader>
            <CardContent>
              {isClientsLoading ? (
                <div className="text-center py-4">Loading clients...</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedClientIds.includes(client.id)}
                        onCheckedChange={() => handleClientToggle(client.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{client.legalName}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.industry} • {client.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!canGoNext}
          className="flex items-center space-x-2"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
