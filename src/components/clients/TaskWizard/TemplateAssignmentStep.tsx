
import React, { useState } from 'react';
import { WizardStep } from './WizardStep';
import { TemplateBrowser } from './TemplateBrowser';
import { ClientSelectorForTemplates } from './ClientSelectorForTemplates';
import { AssignmentConfiguration, AssignmentConfig } from './AssignmentConfiguration';
import { AssignmentPreview } from './AssignmentPreview';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { getAvailableTemplates } from '@/services/templateAssignmentService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface TemplateAssignmentStepProps {
  onNext: () => void;
  onBack: () => void;
  selectedTemplateIds: string[];
  setSelectedTemplateIds: (ids: string[]) => void;
  selectedClientIds: string[];
  setSelectedClientIds: (ids: string[]) => void;
  assignmentConfig: AssignmentConfig;
  setAssignmentConfig: (config: AssignmentConfig) => void;
}

export const TemplateAssignmentStep: React.FC<TemplateAssignmentStepProps> = ({
  onNext,
  onBack,
  selectedTemplateIds,
  setSelectedTemplateIds,
  selectedClientIds,
  setSelectedClientIds,
  assignmentConfig,
  setAssignmentConfig
}) => {
  const [activeTab, setActiveTab] = useState('templates');

  // Fetch templates and clients
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['available-templates'],
    queryFn: getAvailableTemplates,
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  const handleTemplateToggle = (templateId: string) => {
    const newSelection = selectedTemplateIds.includes(templateId)
      ? selectedTemplateIds.filter(id => id !== templateId)
      : [...selectedTemplateIds, templateId];
    setSelectedTemplateIds(newSelection);
  };

  const selectedTemplates = templates.filter(t => selectedTemplateIds.includes(t.id));
  const selectedClients = Array.isArray(clients) 
    ? clients.filter(c => selectedClientIds.includes(c.id))
    : [];

  const canProceed = selectedTemplateIds.length > 0 && selectedClientIds.length > 0;

  const getTabBadgeCount = (tab: string) => {
    switch (tab) {
      case 'templates':
        return selectedTemplateIds.length;
      case 'clients':
        return selectedClientIds.length;
      default:
        return 0;
    }
  };

  return (
    <WizardStep
      title="Template Assignment"
      description="Select templates and clients, then configure the assignment"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates" className="relative">
              Templates
              {getTabBadgeCount('templates') > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getTabBadgeCount('templates')}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="clients" className="relative">
              Clients
              {getTabBadgeCount('clients') > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getTabBadgeCount('clients')}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="configuration">
              Configuration
            </TabsTrigger>
            <TabsTrigger value="preview">
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <TemplateBrowser
              templates={templates}
              onSelectTemplate={handleTemplateToggle}
              selectedTemplateIds={selectedTemplateIds}
              isLoading={isLoadingTemplates}
            />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <ClientSelectorForTemplates
              clients={Array.isArray(clients) ? clients : []}
              onSelectClients={setSelectedClientIds}
              selectedClientIds={selectedClientIds}
              isLoading={isLoadingClients}
              allowMultiple={true}
            />
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4">
            {selectedTemplateIds.length > 0 && selectedClientIds.length > 0 ? (
              <AssignmentConfiguration
                selectedTemplates={selectedTemplates}
                selectedClientIds={selectedClientIds}
                config={assignmentConfig}
                onConfigChange={setAssignmentConfig}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Please select templates and clients first
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <AssignmentPreview
              selectedTemplates={selectedTemplates}
              selectedClients={selectedClients}
              config={assignmentConfig}
              isVisible={true}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>

          <div className="flex items-center gap-2">
            {!canProceed && (
              <p className="text-sm text-muted-foreground">
                Select templates and clients to continue
              </p>
            )}
            <Button 
              onClick={onNext}
              disabled={!canProceed}
            >
              Continue to Confirmation
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </WizardStep>
  );
};
