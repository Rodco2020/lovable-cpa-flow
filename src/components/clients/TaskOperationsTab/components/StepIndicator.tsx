
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

/**
 * StepIndicator Component
 * 
 * Displays a visual indicator for each step in the assignment wizard.
 * Shows completion status with appropriate styling and icons.
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  label, 
  isActive, 
  isComplete 
}) => (
  <div className={`flex items-center space-x-2 ${
    isActive ? 'text-primary' : 
    isComplete ? 'text-green-600' : 
    'text-muted-foreground'
  }`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
      isActive ? 'bg-primary text-primary-foreground' : 
      isComplete ? 'bg-green-600 text-white' : 
      'bg-muted text-muted-foreground'
    }`}>
      {isComplete ? <CheckCircle className="h-3 w-3" /> : isActive ? '●' : '○'}
    </div>
    <span className="font-medium">{label}</span>
  </div>
);
