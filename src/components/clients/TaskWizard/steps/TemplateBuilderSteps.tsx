
import React from 'react';
import { WizardStep } from '../WizardStep';
import { SelectTasksStep } from '../../CopyTasks/SelectTasksStep';
import { TemplateBuilder } from '../TemplateBuilder';
import { Client } from '@/types/client';
import { TaskInstance, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';
import { WizardStep as WizardStepType } from '../types';

interface TemplateBuilderStepsProps {
  currentStep: WizardStepType;
  initialClientId?: string;
  clients: Client[];
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  onStepChange: (step: WizardStepType) => void;
  onTemplateCreated: (templateData: any) => void;
}

export const TemplateBuilderSteps: React.FC<TemplateBuilderStepsProps> = ({
  currentStep,
  initialClientId,
  clients,
  selectedTaskIds,
  setSelectedTaskIds,
  onStepChange,
  onTemplateCreated
}) => {
  switch (currentStep) {
    case 'task-selection':
      if (initialClientId) {
        return (
          <WizardStep 
            title="Select Tasks for Template"
            description="Choose tasks to convert into a reusable template"
          >
            <SelectTasksStep 
              clientId={initialClientId}
              targetClientId={initialClientId}
              selectedTaskIds={selectedTaskIds}
              setSelectedTaskIds={setSelectedTaskIds}
              step="select-tasks"
              handleBack={() => onStepChange('action-selection')}
              handleNext={() => onStepChange('configuration')}
              isTemplateBuilder={true}
            />
          </WizardStep>
        );
      }
      return null;

    case 'configuration':
      if (selectedTaskIds.length > 0) {
        // Create proper TaskInstance objects with all required properties
        const tasksForBuilder = selectedTaskIds.map(taskId => {
          const sourceClient = clients.find((c: Client) => c.id === initialClientId) || clients[0];
          
          const mockTask: TaskInstance = {
            id: taskId,
            templateId: `template-${taskId}`,
            clientId: initialClientId || '',
            name: `Task ${taskId}`,
            description: 'Task description from existing client task',
            estimatedHours: 2,
            requiredSkills: ['Tax Preparation'],
            priority: 'Medium' as TaskPriority,
            category: 'Tax' as TaskCategory,
            status: 'Unscheduled' as TaskStatus,
            dueDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            notes: 'Converted from client task'
          };

          return {
            task: mockTask,
            client: sourceClient
          };
        });

        return (
          <TemplateBuilder
            selectedTasks={tasksForBuilder}
            onTemplateCreated={onTemplateCreated}
            onCancel={() => onStepChange('task-selection')}
          />
        );
      }
      return null;

    case 'success':
      return (
        <WizardStep 
          title="Template Created"
          description="Your template has been successfully created"
        >
          <div className="text-center py-8 text-green-600">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Template Created Successfully!</h3>
              <p className="text-gray-600">
                Template created from {selectedTaskIds.length} selected task(s)
              </p>
            </div>
          </div>
        </WizardStep>
      );

    default:
      return null;
  }
};
