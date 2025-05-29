
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useTemplateAssignmentWorkflow } from './hooks/useTemplateAssignmentWorkflow';
import { TemplateAssignmentStepRenderer } from './components/TemplateAssignmentStepRenderer';

interface TemplateAssignmentTabProps {
  onClose?: () => void;
  onTasksRefresh?: () => void;
}

export const TemplateAssignmentTab: React.FC<TemplateAssignmentTabProps> = ({ 
  onClose, 
  onTasksRefresh 
}) => {
  const {
    currentStep,
    setCurrentStep,
    templateAssignmentHook,
    progressHook,
    handleNext,
    handleExecuteAssignment,
    handleReset,
    canGoNext
  } = useTemplateAssignmentWorkflow(onTasksRefresh);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Template Assignment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TemplateAssignmentStepRenderer
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          templateAssignmentHook={templateAssignmentHook}
          progressHook={progressHook}
          handleNext={handleNext}
          handleExecuteAssignment={handleExecuteAssignment}
          handleReset={handleReset}
          canGoNext={canGoNext}
          onClose={onClose}
        />
      </CardContent>
    </Card>
  );
};
