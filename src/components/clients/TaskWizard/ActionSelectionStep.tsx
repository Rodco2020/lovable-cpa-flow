
import React from 'react';
import { Copy, FileTemplate, Users, Wrench } from 'lucide-react';
import { WizardStep } from './WizardStep';
import { ActionCard } from './ActionCard';
import { useWizard } from './WizardContext';
import { WizardAction } from './types';

interface ActionSelectionStepProps {
  onActionSelect: (action: WizardAction) => void;
}

export const ActionSelectionStep: React.FC<ActionSelectionStepProps> = ({
  onActionSelect
}) => {
  const { setSelectedAction } = useWizard();

  const handleActionSelect = (action: WizardAction) => {
    setSelectedAction(action);
    onActionSelect(action);
  };

  const actions = [
    {
      id: 'copy-from-client' as WizardAction,
      title: 'Enhanced Copy from Client',
      description: 'Copy tasks from one client to another with advanced filtering and customization options.',
      icon: Copy,
      status: 'available' as const
    },
    {
      id: 'template-assignment' as WizardAction,
      title: 'Template Assignment',
      description: 'Assign task templates directly to clients with customizable parameters and scheduling.',
      icon: FileTemplate,
      status: 'coming-soon' as const
    },
    {
      id: 'bulk-operations' as WizardAction,
      title: 'Bulk Operations',
      description: 'Perform bulk task assignments across multiple clients with advanced batch processing.',
      icon: Users,
      status: 'coming-soon' as const
    },
    {
      id: 'template-builder' as WizardAction,
      title: 'Template Builder',
      description: 'Create new task templates from existing client tasks with intelligent recommendations.',
      icon: Wrench,
      status: 'coming-soon' as const
    }
  ];

  return (
    <WizardStep 
      title="Choose Action"
      description="Select the type of task operation you want to perform"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            title={action.title}
            description={action.description}
            icon={action.icon}
            status={action.status}
            onClick={action.status === 'available' ? () => handleActionSelect(action.id) : undefined}
          />
        ))}
      </div>
    </WizardStep>
  );
};
