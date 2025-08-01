
import React from 'react';
import { TaskTemplate } from '@/types/task';
import { Skill } from '@/types/skill';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import TaskTemplateActions from './TaskTemplateActions';

interface TaskTemplateTableProps {
  templates: TaskTemplate[];
  skills: Skill[];
  isLoading: boolean;
  onEditTemplate: (template: TaskTemplate) => void;
  onArchiveTemplate: (id: string) => void;
  onDeleteTemplate: (id: string, name: string) => void;
}

/**
 * Component for displaying task templates in a table with action buttons
 * Handles rendering templates and provides edit/archive/delete functionality
 */
const TaskTemplateTable: React.FC<TaskTemplateTableProps> = ({
  templates,
  skills,
  isLoading,
  onEditTemplate,
  onArchiveTemplate,
  onDeleteTemplate
}) => {
  // Helper function to find skill name by ID
  const findSkillById = (skillId: string): string => {
    // Always ensure we're comparing strings
    const normalizedSkillId = skillId.toString();
    const skill = skills.find(s => s.id.toString() === normalizedSkillId);
    
    if (skill) {
      return skill.name;
    } else {
      console.warn(`Skill with ID ${normalizedSkillId} not found`);
      return normalizedSkillId;
    }
  };

  const handleEdit = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onEditTemplate(template);
    }
  };

  const handleDelete = (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTemplate(templateId, templateName);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Est. Hours</TableHead>
          <TableHead>Required Skills</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Version</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              No task templates found. Create a new template to get started.
            </TableCell>
          </TableRow>
        ) : (
          templates.map(template => (
            <TableRow 
              key={template.id}
              className={template.isArchived ? "bg-gray-100" : ""}
            >
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.category}</TableCell>
              <TableCell>{template.defaultEstimatedHours}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(template.requiredSkills) && template.requiredSkills.length > 0 ? (
                    template.requiredSkills.map(skillId => (
                      <span 
                        key={skillId.toString()} 
                        className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800"
                      >
                        {findSkillById(skillId.toString())}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">No required skills</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  template.defaultPriority === 'Low' ? 'bg-green-100 text-green-800' :
                  template.defaultPriority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                  template.defaultPriority === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {template.defaultPriority}
                </span>
              </TableCell>
              <TableCell>v{template.version}</TableCell>
              <TableCell className="text-right">
                <TaskTemplateActions
                  templateId={template.id}
                  templateName={template.name}
                  isArchived={template.isArchived}
                  onEdit={handleEdit}
                  onArchive={onArchiveTemplate}
                  onDelete={handleDelete}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TaskTemplateTable;
