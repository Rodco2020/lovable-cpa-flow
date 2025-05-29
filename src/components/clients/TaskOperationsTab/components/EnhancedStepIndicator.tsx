
import React from 'react';
import { CheckCircle, Circle, Users, Target, Copy, FileCheck, Cog, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StepConfig {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface EnhancedStepIndicatorProps {
  currentStep: string;
  steps: StepConfig[];
  sourceClientName?: string;
  targetClientName?: string;
}

/**
 * Enhanced Step Indicator - Updated for 6-Step Workflow
 * 
 * This component has been enhanced to support the complete 6-step workflow:
 * 1. Select Source Client - Choose the client to copy FROM
 * 2. Select Target Client - Choose the client to copy TO  
 * 3. Select Tasks - Choose which tasks to copy
 * 4. Confirm Operation - Review and confirm the copy
 * 5. Processing - Execute the copy operation
 * 6. Complete - Show results and cleanup
 * 
 * Features:
 * - Dynamic step icons based on step type
 * - Progress percentage calculation
 * - Client context display
 * - Visual step completion indicators
 * - Enhanced tooltips and descriptions
 */

const STEP_ICON_MAP = {
  'select-source-client': Users,
  'selection': Target,
  'task-selection': Copy,
  'confirmation': FileCheck,
  'processing': Cog,
  'complete': CheckCircle2
} as const;

const STEP_DESCRIPTIONS = {
  'select-source-client': 'Choose source client',
  'selection': 'Choose target client', 
  'task-selection': 'Select tasks to copy',
  'confirmation': 'Review and confirm',
  'processing': 'Copying in progress',
  'complete': 'Operation complete'
} as const;

const getStepIcon = (stepKey: string) => {
  return STEP_ICON_MAP[stepKey as keyof typeof STEP_ICON_MAP] || Circle;
};

const getStepDescription = (stepKey: string, sourceClientName?: string, targetClientName?: string) => {
  const baseDescription = STEP_DESCRIPTIONS[stepKey as keyof typeof STEP_DESCRIPTIONS] || '';
  
  switch (stepKey) {
    case 'select-source-client':
      return sourceClientName ? `Source: ${sourceClientName}` : baseDescription;
    case 'selection':
      return targetClientName ? `Target: ${targetClientName}` : baseDescription;
    default:
      return baseDescription;
  }
};

export const EnhancedStepIndicator: React.FC<EnhancedStepIndicatorProps> = ({ 
  currentStep, 
  steps, 
  sourceClientName, 
  targetClientName 
}) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const currentIndex = getCurrentStepIndex();
  const progressPercentage = Math.round(((currentIndex + 1) / steps.length) * 100);

  return (
    <div className="w-full">
      {/* Enhanced Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Step {currentIndex + 1} of {steps.length}</span>
          <span>{progressPercentage}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const StepIcon = getStepIcon(step.key);
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const description = getStepDescription(step.key, sourceClientName, targetClientName);
          
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                {/* Icon Circle */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-100 border-green-500 text-green-600'
                    : isCurrent
                    ? 'bg-blue-100 border-blue-500 text-blue-600 ring-4 ring-blue-100'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-center max-w-20">
                  <span className={`text-xs font-medium block ${
                    index <= currentIndex ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  <span className={`text-xs mt-1 block ${
                    index <= currentIndex ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {description}
                  </span>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced Context Information */}
      {(sourceClientName || targetClientName) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-center space-x-4 text-sm">
            {sourceClientName && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                  FROM
                </Badge>
                <span className="font-medium text-orange-800">{sourceClientName}</span>
              </div>
            )}
            {sourceClientName && targetClientName && (
              <span className="text-gray-400">→</span>
            )}
            {targetClientName && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  TO
                </Badge>
                <span className="font-medium text-blue-800">{targetClientName}</span>
              </div>
            )}
          </div>
          
          {/* Step Progress Indicator */}
          <div className="mt-2 text-center">
            <span className="text-xs text-gray-500">
              {currentStep === 'select-source-client' && 'Select the client to copy tasks from'}
              {currentStep === 'selection' && 'Select the client to copy tasks to'}
              {currentStep === 'task-selection' && 'Choose which tasks to copy'}
              {currentStep === 'confirmation' && 'Review your selections before copying'}
              {currentStep === 'processing' && 'Copying tasks between clients...'}
              {currentStep === 'complete' && 'Copy operation completed'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
