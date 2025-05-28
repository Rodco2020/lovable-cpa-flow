
import React from 'react';
import { TaskTemplate } from '@/types/task';
import { Skill } from '@/types/skill';
import { 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import FormFields from './TaskTemplateForm/FormFields';
import SkillSelection from './TaskTemplateForm/SkillSelection';
import FormActions from './TaskTemplateForm/FormActions';
import { useSkillCleanup } from './TaskTemplateForm/hooks/useSkillCleanup';

interface TaskTemplateFormProps {
  editingTemplate: TaskTemplate | null;
  isSubmitting: boolean;
  formData: Partial<TaskTemplate>;
  skills: Skill[];
  isLoadingSkills: boolean;
  onFormChange: (key: string, value: any) => void;
  onSkillChange: (skillId: string, checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSkillSelected: (skillId: string) => boolean;
  getUnmatchedSkills?: (availableSkills: Array<{id: string, name: string}>) => string[];
  cleanupSkills?: (availableSkills: Array<{id: string, name: string}>) => void;
}

/**
 * Component for creating and editing task templates
 * Handles the form UI and input changes
 */
const TaskTemplateForm: React.FC<TaskTemplateFormProps> = ({
  editingTemplate,
  isSubmitting,
  formData,
  skills,
  isLoadingSkills,
  onFormChange,
  onSkillChange,
  onSubmit,
  isSkillSelected,
  getUnmatchedSkills,
  cleanupSkills
}) => {
  // Use custom hook for skill cleanup logic
  const { unmatchedSkills } = useSkillCleanup({
    skills,
    editingTemplate,
    getUnmatchedSkills,
    cleanupSkills
  });

  // Enhanced input change handler with debugging
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log('TaskTemplateForm: Input change detected:', {
      name,
      value,
      type: e.target.type,
      formData: { ...formData }
    });
    
    if (name === 'defaultEstimatedHours') {
      const numericValue = parseFloat(value);
      console.log('TaskTemplateForm: Converting hours to numeric:', value, '->', numericValue);
      onFormChange(name, numericValue);
    } else {
      onFormChange(name, value);
    }
  };

  // Enhanced skill change handler with debugging
  const handleSkillChange = (skillId: string, checked: boolean) => {
    console.log('TaskTemplateForm: Skill change requested:', {
      skillId,
      checked,
      skillName: skills.find(s => s.id === skillId)?.name,
      currentFormData: { ...formData }
    });
    onSkillChange(skillId, checked);
  };

  // Handle removal of unmatched skills
  const handleRemoveUnmatchedSkill = (skillId: string) => {
    console.log('TaskTemplateForm: Removing unmatched skill:', skillId);
    handleSkillChange(skillId, false);
  };

  // Enhanced form submit handler with debugging
  const handleSubmit = (e: React.FormEvent) => {
    console.log('TaskTemplateForm: Form submit requested:', {
      formData: { ...formData },
      editingTemplate: editingTemplate?.name || 'new template'
    });
    onSubmit(e);
  };

  console.log('TaskTemplateForm: Rendering with props:', {
    editingTemplate: editingTemplate?.name || 'new template',
    isSubmitting,
    formDataSnapshot: { ...formData },
    skillsCount: skills.length,
    isLoadingSkills
  });

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{editingTemplate ? 'Edit Task Template' : 'Create New Task Template'}</DialogTitle>
        <DialogDescription>
          {editingTemplate ? 'Update the details of your task template.' : 'Create a new task template for standardized tasks.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormFields 
          formData={formData}
          isSubmitting={isSubmitting}
          onInputChange={handleInputChange}
        />
        
        <SkillSelection 
          skills={skills}
          isLoadingSkills={isLoadingSkills}
          isSubmitting={isSubmitting}
          isSkillSelected={isSkillSelected}
          onSkillChange={handleSkillChange}
          unmatchedSkills={unmatchedSkills}
          onRemoveUnmatchedSkill={handleRemoveUnmatchedSkill}
        />
        
        <FormActions 
          editingTemplate={editingTemplate}
          isSubmitting={isSubmitting}
        />
      </form>
    </DialogContent>
  );
};

export default TaskTemplateForm;
