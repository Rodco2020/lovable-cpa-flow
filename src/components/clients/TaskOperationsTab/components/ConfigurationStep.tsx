
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssignmentConfiguration } from '../../TaskWizard/AssignmentConfiguration';

interface ConfigurationStepProps {
  assignmentConfig: any;
  setAssignmentConfig: (config: any) => void;
  selectedTemplateIds: string[];
  selectedClientIds: string[];
  availableTemplates: any[];
  onBack: () => void;
  onNext: () => void;
}

/**
 * ConfigurationStep Component
 * 
 * Second step of the template assignment wizard.
 * Handles assignment configuration settings.
 */
export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
  assignmentConfig,
  setAssignmentConfig,
  selectedTemplateIds,
  selectedClientIds,
  availableTemplates,
  onBack,
  onNext
}) => {
  const selectedTemplates = availableTemplates.filter(t => selectedTemplateIds.includes(t.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentConfiguration
            selectedTemplates={selectedTemplates}
            selectedClientIds={selectedClientIds}
            config={assignmentConfig}
            onConfigChange={setAssignmentConfig}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Selection
        </Button>
        <Button onClick={onNext}>
          Review & Confirm
        </Button>
      </div>
    </div>
  );
};
