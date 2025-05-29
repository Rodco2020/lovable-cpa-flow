
import React from 'react';
import { CheckCircle, Circle, Users, Target, Copy, FileCheck, Cog, CheckCircle2 } from 'lucide-react';

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

const getStepIcon = (stepKey: string) => {
  switch (stepKey) {
    case 'select-source-client':
      return Users;
    case 'select-target-client':
    case 'selection':
      return Target;
    case 'select-tasks':
    case 'task-selection':
      return Copy;
    case 'confirm':
    case 'confirmation':
      return FileCheck;
    case 'processing':
      return Cog;
    case 'success':
    case 'complete':
      return CheckCircle2;
    default:
      return Circle;
  }
};

const getStepDescription = (stepKey: string, sourceClientName?: string, targetClientName?: string) => {
  switch (stepKey) {
    case 'select-source-client':
      return 'Choose source client';
    case 'select-target-client':
    case 'selection':
      return 'Choose target client';
    case 'select-tasks':
    case 'task-selection':
      return 'Select tasks to copy';
    case 'confirm':
    case 'confirmation':
      return 'Review and confirm';
    case 'processing':
      return 'Copying tasks';
    case 'success':
    case 'complete':
      return 'Copy completed';
    default:
      return '';
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

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Step {currentIndex + 1} of {steps.length}</span>
          <span>{Math.round(((currentIndex + 1) / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
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

      {/* Context Information */}
      {(sourceClientName || targetClientName) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-4 text-sm">
            {sourceClientName && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">From:</span>
                <span className="font-medium text-orange-700">{sourceClientName}</span>
              </div>
            )}
            {sourceClientName && targetClientName && (
              <span className="text-gray-400">→</span>
            )}
            {targetClientName && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-500">To:</span>
                <span className="font-medium text-blue-700">{targetClientName}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
