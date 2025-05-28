
import React, { useState } from 'react';
import { TaskTemplate } from '@/types/task';
import { Skill } from '@/types/skill';
import { Dialog } from '@/components/ui/dialog';
import { useTaskTemplateForm } from '@/hooks/useTaskTemplateForm/index';
import TaskTemplateForm from './TaskTemplateForm';

interface TaskTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate: TaskTemplate | null;
  skills: Skill[];
  isLoadingSkills: boolean;
  onSubmit: (submissionData: any, isEditing: boolean, templateId?: string) => Promise<void>;
}

/**
 * Component that manages the task template dialog and form state
 * Handles the form logic and submission for both create and edit operations
 */
const TaskTemplateDialog: React.FC<TaskTemplateDialogProps> = ({
  isOpen,
  onOpenChange,
  editingTemplate,
  skills,
  isLoadingSkills,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use custom hook for form state management
  const { 
    formData, 
    resetForm, 
    updateField, 
    handleSkillChange, 
    isSkillSelected,
    getUnmatchedSkills,
    cleanupSkills,
    prepareFormDataForSubmission 
  } = useTaskTemplateForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Use the prepareFormDataForSubmission function to ensure consistent data format
      const submissionData = prepareFormDataForSubmission();
      console.log('Form data before submission:', submissionData);
      
      await onSubmit(submissionData, !!editingTemplate, editingTemplate?.id);
      
      // Close dialog on success
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens/closes or editing template changes
  React.useEffect(() => {
    if (isOpen) {
      if (editingTemplate) {
        console.log('TaskTemplateDialog: Resetting form with template data');
        resetForm(editingTemplate);
      } else {
        console.log('TaskTemplateDialog: Resetting form for new template');
        resetForm();
      }
    }
  }, [isOpen, editingTemplate, resetForm]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <TaskTemplateForm 
        editingTemplate={editingTemplate}
        isSubmitting={isSubmitting}
        formData={formData}
        skills={skills}
        isLoadingSkills={isLoadingSkills}
        onFormChange={updateField}
        onSkillChange={handleSkillChange}
        onSubmit={handleSubmit}
        isSkillSelected={isSkillSelected}
        getUnmatchedSkills={getUnmatchedSkills}
        cleanupSkills={cleanupSkills}
      />
    </Dialog>
  );
};

export default TaskTemplateDialog;
