
import React from 'react';
import { TaskInstance, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';

// Mock component to fix the build error
export const TemplateBuilderSteps: React.FC = () => {
  // Create a mock TaskInstance with all required properties
  const mockTaskInstance: TaskInstance = {
    id: 'mock-id',
    templateId: 'mock-template',
    clientId: 'mock-client',
    name: 'Mock Task',
    description: 'Mock description',
    estimatedHours: 1,
    requiredSkills: ['Junior'],
    priority: 'Medium' as TaskPriority,
    category: 'Client Work' as TaskCategory,
    status: 'Unscheduled' as TaskStatus,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: 'Mock notes',
    recurringTaskId: 'mock-recurring-task-id' // FIXED: Added the required property
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Template Builder Steps</h2>
      <p>This component is under construction.</p>
      <pre className="mt-4 p-2 bg-gray-100 rounded text-xs">
        {JSON.stringify(mockTaskInstance, null, 2)}
      </pre>
    </div>
  );
};

export default TemplateBuilderSteps;
