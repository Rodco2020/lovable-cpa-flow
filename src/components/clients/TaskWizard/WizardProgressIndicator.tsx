
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { WizardStep } from './types';

interface WizardProgressIndicatorProps {
  currentStep: WizardStep;
  selectedAction?: string;
}

const stepLabels: Record<WizardStep, string> = {
  'action-selection': 'Select Action',
  'client-selection': 'Choose Client',
  'task-selection': 'Select Tasks',
  'configuration': 'Configure',
  'confirmation': 'Confirm',
  'processing': 'Processing',
  'success': 'Complete'
};

const stepOrder: WizardStep[] = ['action-selection', 'client-selection', 'task-selection', 'configuration', 'confirmation', 'processing', 'success'];

export const WizardProgressIndicator: React.FC<WizardProgressIndicatorProps> = ({
  currentStep,
  selectedAction
}) => {
  const currentIndex = stepOrder.indexOf(currentStep);
  const progress = ((currentIndex + 1) / stepOrder.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Task Assignment Wizard</h2>
        {selectedAction && (
          <Badge variant="outline" className="capitalize">
            {selectedAction.replace('-', ' ')}
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentIndex + 1} of {stepOrder.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
        <p className="text-sm font-medium">{stepLabels[currentStep]}</p>
      </div>
    </div>
  );
};
