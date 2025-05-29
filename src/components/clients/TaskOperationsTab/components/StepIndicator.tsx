
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface StepConfig {
  key: string;
  label: string;
}

interface StepIndicatorProps {
  currentStep: string;
  steps: StepConfig[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              index < currentIndex
                ? 'bg-green-100 border-green-500 text-green-600'
                : index === currentIndex
                ? 'bg-blue-100 border-blue-500 text-blue-600'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            }`}>
              {index < currentIndex ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <span className={`mt-2 text-xs font-medium ${
              index <= currentIndex ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};
