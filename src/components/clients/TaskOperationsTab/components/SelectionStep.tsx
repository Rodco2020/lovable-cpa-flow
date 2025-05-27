
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileCheck, 
  Users, 
  AlertCircle,
  Settings
} from 'lucide-react';
import { TemplateBrowser } from '../../TaskWizard/TemplateBrowser';
import { MultiClientSelector } from '../../TaskWizard/MultiClientSelector';

interface SelectionStepProps {
  selectedTemplateIds: string[];
  handleTemplateToggle: (id: string) => void;
  availableTemplates: any[];
  isTemplatesLoading: boolean;
  selectedClientIds: string[];
  setSelectedClientIds: (ids: string[]) => void;
  availableClients: any[];
  isClientsLoading: boolean;
  canProceed: boolean;
  validationErrors: string[];
  onNext: () => void;
}

/**
 * SelectionStep Component
 * 
 * First step of the template assignment wizard.
 * Handles template and client selection with validation.
 */
export const SelectionStep: React.FC<SelectionStepProps> = ({
  selectedTemplateIds,
  handleTemplateToggle,
  availableTemplates,
  isTemplatesLoading,
  selectedClientIds,
  setSelectedClientIds,
  availableClients,
  isClientsLoading,
  canProceed,
  validationErrors,
  onNext
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Select Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateBrowser
            templates={availableTemplates}
            selectedTemplateIds={selectedTemplateIds}
            onSelectTemplate={handleTemplateToggle}
            isLoading={isTemplatesLoading}
          />
        </CardContent>
      </Card>

      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MultiClientSelector
            clients={availableClients}
            selectedClientIds={selectedClientIds}
            onSelectionChange={setSelectedClientIds}
            isLoading={isClientsLoading}
          />
        </CardContent>
      </Card>
    </div>

    {/* Validation Errors */}
    {validationErrors.length > 0 && (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index}>• {error}</div>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    )}

    {/* Selection Summary */}
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className="text-muted-foreground">Templates: </span>
              <span className="font-medium">{selectedTemplateIds.length} selected</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Clients: </span>
              <span className="font-medium">{selectedClientIds.length} selected</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Total Operations: </span>
              <span className="font-medium">{selectedTemplateIds.length * selectedClientIds.length}</span>
            </div>
          </div>
          <Button 
            onClick={onNext} 
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Configure Assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
