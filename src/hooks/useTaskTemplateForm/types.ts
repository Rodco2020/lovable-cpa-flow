
import { TaskTemplate, TaskPriority } from '@/types/task';

export interface TaskTemplateFormData {
  name: string;
  description: string;
  defaultEstimatedHours: number;
  requiredSkills: string[];
  defaultPriority: TaskPriority;
  category: string;
}

export interface UseTaskTemplateFormReturn {
  formData: Partial<TaskTemplate>;
  resetForm: (template?: TaskTemplate | null) => void;
  updateField: (key: string, value: any) => void;
  handleSkillChange: (skillId: string, checked: boolean) => void;
  isSkillSelected: (skillId: string) => boolean;
  getUnmatchedSkills: (availableSkills: Array<{id: string, name: string}>) => string[];
  cleanupSkills: (availableSkills: Array<{id: string, name: string}>) => void;
  prepareFormDataForSubmission: () => Partial<TaskTemplate>;
}
