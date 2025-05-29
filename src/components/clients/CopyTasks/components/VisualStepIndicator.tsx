
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { CopyTaskStep } from '../types';

interface VisualStepIndicatorProps {
  currentStep: CopyTaskStep;
  sourceClientName?: string;
  targetClientName?: string;
}

const STEP_CONFIG = {
  'select-source-client': {
    label: 'Source Client',
    description: 'Select FROM client',
    position: 1,
    color: 'orange'
  },
  'select-target-client': {
    label: 'Target Client', 
    description: 'Select TO client',
    position: 2,
    color: 'blue'
  },
  'select-tasks': {
    label: 'Select Tasks',
    description: 'Choose tasks to copy',
    position: 3,
    color: 'purple'
  },
  'confirm': {
    label: 'Confirm',
    description: 'Review and confirm',
    position: 4,
    color: 'green'
  },
  'processing': {
    label: 'Processing',
    description: 'Copying in progress',
    position: 5,
    color: 'blue'
  },
  'success': {
    label: 'Complete',
    description: 'Copy successful',
    position: 6,
    color: 'green'
  }
} as const;

export const VisualStepIndicator: React.FC<VisualStepIndicatorProps> = ({
  currentStep,
  sourceClientName,
  targetClientName
}) => {
  const steps = Object.entries(STEP_CONFIG);
  const currentStepPosition = STEP_CONFIG[currentStep]?.position || 1;

  return (
    <div className="w-full space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Step {currentStepPosition} of {steps.length}</span>
          <span>{Math.round((currentStepPosition / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStepPosition / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Visual Step Flow */}
      <div className="flex items-center justify-between w-full">
        {steps.map(([stepKey, config], index) => {
          const isCompleted = config.position < currentStepPosition;
          const isCurrent = stepKey === currentStep;
          const stepColor = config.color;
          
          return (
            <React.Fragment key={stepKey}>
              <div className="flex flex-col items-center space-y-2">
                {/* Step Circle */}
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-100 border-green-500 text-green-600' 
                    : isCurrent
                    ? `bg-${stepColor}-100 border-${stepColor}-500 text-${stepColor}-600 ring-4 ring-${stepColor}-100`
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                
                {/* Step Label */}
                <div className="text-center max-w-20">
                  <Badge 
                    variant={isCurrent ? "default" : "outline"}
                    className={`text-xs mb-1 ${
                      isCurrent ? `bg-${stepColor}-500` : ''
                    }`}
                  >
                    {config.label}
                  </Badge>
                  <p className={`text-xs ${
                    index <= currentStepPosition - 1 ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {config.description}
                  </p>
                </div>
              </div>
              
              {/* Arrow Connector */}
              {index < steps.length - 1 && (
                <ArrowRight className={`w-4 h-4 ${
                  config.position < currentStepPosition ? 'text-green-500' : 'text-gray-300'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Client Context Banner */}
      {(sourceClientName || targetClientName) && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 rounded-lg border border-gray-200">
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
              <ArrowRight className="text-gray-400 w-4 h-4" />
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
        </div>
      )}
    </div>
  );
};
