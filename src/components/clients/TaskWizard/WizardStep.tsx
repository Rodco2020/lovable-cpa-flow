
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface WizardStepProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  children,
  title,
  description,
  className = ""
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium leading-none">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  );
};
