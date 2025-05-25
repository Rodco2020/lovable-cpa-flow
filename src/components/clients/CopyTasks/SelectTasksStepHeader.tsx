
import React from 'react';

interface SelectTasksStepHeaderProps {
  isTemplateBuilder: boolean;
}

export const SelectTasksStepHeader: React.FC<SelectTasksStepHeaderProps> = ({
  isTemplateBuilder
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">
        {isTemplateBuilder ? 'Select Tasks for Template' : 'Select Tasks to Copy'}
      </h2>
      <p className="text-muted-foreground">
        {isTemplateBuilder 
          ? 'Choose the tasks you want to convert into a reusable template.'
          : 'Choose the tasks you want to copy from this client to the destination client.'
        }
      </p>
    </div>
  );
};
