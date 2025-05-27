
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StepIndicator } from './StepIndicator';

type WizardStep = 'selection' | 'configuration' | 'confirmation' | 'processing' | 'complete';

interface ProgressHeaderProps {
  currentStep: WizardStep;
}

/**
 * ProgressHeader Component
 * 
 * Displays the current step and progress indicators for the assignment wizard.
 */
export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ currentStep }) => {
  const getStepNumber = (step: WizardStep): number => {
    const steps = { selection: 1, configuration: 2, confirmation: 3, processing: 4, complete: 5 };
    return steps[step];
  };

  const isStepComplete = (stepName: WizardStep): boolean => {
    const stepOrder = ['selection', 'configuration', 'confirmation', 'processing', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepName);
    return stepIndex < currentIndex;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Assign Templates to Clients</h2>
        <div className="flex items-center gap-2">
          <Badge variant={currentStep === 'complete' ? 'default' : 'outline'}>
            Step {getStepNumber(currentStep)} of 5
          </Badge>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center space-x-4 text-sm">
        <StepIndicator 
          label="Selection" 
          isActive={currentStep === 'selection'} 
          isComplete={isStepComplete('selection')}
        />
        <StepIndicator 
          label="Configuration" 
          isActive={currentStep === 'configuration'} 
          isComplete={isStepComplete('configuration')}
        />
        <StepIndicator 
          label="Confirmation" 
          isActive={currentStep === 'confirmation'} 
          isComplete={isStepComplete('confirmation')}
        />
        <StepIndicator 
          label="Processing" 
          isActive={currentStep === 'processing'} 
          isComplete={isStepComplete('processing')}
        />
        <StepIndicator 
          label="Complete" 
          isActive={currentStep === 'complete'} 
          isComplete={false}
        />
      </div>
    </div>
  );
};
