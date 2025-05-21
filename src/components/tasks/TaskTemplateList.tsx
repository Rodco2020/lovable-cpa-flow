
import React, { useState, useEffect } from 'react';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';
import { 
  getTaskTemplates, 
  createTaskTemplate, 
  updateTaskTemplate, 
  archiveTaskTemplate 
} from '@/services/taskService';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Archive, Edit, Plus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllSkills } from '@/services/skillService';
import { Skill } from '@/types/skill';

const TaskTemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch skills from the database using React Query
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills
  });

  // Form state for new/edited template
  const [formData, setFormData] = useState<Partial<TaskTemplate>>({
    name: '',
    description: '',
    defaultEstimatedHours: 1,
    requiredSkills: [],
    defaultPriority: 'Medium',
    category: 'Other',
  });

  // Fetch templates on component mount and when showArchived changes
  useEffect(() => {
    refreshTemplates();
  }, [showArchived]);

  const refreshTemplates = async () => {
    setIsLoading(true);
    try {
      const fetchedTemplates = await getTaskTemplates(showArchived);
      console.log('Fetched templates:', fetchedTemplates);
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load task templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    // The useEffect will trigger the refreshTemplates
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      defaultEstimatedHours: 1,
      requiredSkills: [],
      defaultPriority: 'Medium',
      category: 'Other',
    });
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    // Log template skills for debugging
    console.log('Editing template with skills:', template.requiredSkills);
    
    // Important: Store the normalized skill IDs as strings
    const normalizedSkills = template.requiredSkills.map(skillId => skillId.toString());
    console.log('Normalized skills for form:', normalizedSkills);
    
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      defaultEstimatedHours: template.defaultEstimatedHours,
      requiredSkills: normalizedSkills, // Use normalized skills
      defaultPriority: template.defaultPriority,
      category: template.category,
    });
    setIsDialogOpen(true);
  };

  const handleArchiveTemplate = async (id: string) => {
    try {
      const result = await archiveTaskTemplate(id);
      if (result) {
        toast({
          title: "Template Archived",
          description: "The task template has been archived successfully.",
        });
        refreshTemplates();
      } else {
        toast({
          title: "Error",
          description: "Could not archive template.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error archiving template:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while archiving the template.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'defaultEstimatedHours') {
      setFormData({...formData, [name]: parseFloat(value)});
    } else {
      setFormData({...formData, [name]: value});
    }
  };

  const handleSkillChange = (skillId: string, checked: boolean) => {
    // Ensure skillId is a string
    const normalizedSkillId = skillId.toString();
    console.log(`Skill ${normalizedSkillId} changed to ${checked}`);
    
    // Create a new array to ensure React detects the state change
    // Get current skills (or empty array if undefined)
    const currentSkills = formData.requiredSkills || [];
    
    let updatedSkills: string[];
    if (checked) {
      // Add skill only if it doesn't already exist
      updatedSkills = [...currentSkills];
      if (!updatedSkills.includes(normalizedSkillId)) {
        updatedSkills.push(normalizedSkillId);
      }
    } else {
      // Remove skill
      updatedSkills = currentSkills.filter(s => s.toString() !== normalizedSkillId);
    }
    
    // Update form data with new skills array
    setFormData({
      ...formData,
      requiredSkills: updatedSkills
    });
    
    console.log('Updated form data skills:', updatedSkills);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Form data before submission:', formData);
      
      if (editingTemplate) {
        // Update existing template
        const updated = await updateTaskTemplate(editingTemplate.id, {
          ...formData,
          requiredSkills: formData.requiredSkills || [] // Ensure we're sending an array even if it's empty
        });
        
        if (updated) {
          console.log('Template updated successfully:', updated);
          toast({
            title: "Template Updated",
            description: "The task template has been updated successfully.",
          });
        } else {
          throw new Error("Failed to update template");
        }
      } else {
        // Create new template
        const newTemplate = await createTaskTemplate({
          name: formData.name!,
          description: formData.description!,
          defaultEstimatedHours: formData.defaultEstimatedHours!,
          requiredSkills: formData.requiredSkills as string[], // Using string[] type
          defaultPriority: formData.defaultPriority as TaskPriority,
          category: formData.category as TaskCategory
        });
        
        if (!newTemplate) {
          throw new Error("Failed to create template");
        }
        
        toast({
          title: "Template Created",
          description: "The new task template has been created successfully.",
        });
      }
      
      // Close dialog and refresh list
      setIsDialogOpen(false);
      refreshTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the template.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if a skill is selected
  const isSkillSelected = (skillId: string): boolean => {
    if (!formData.requiredSkills) return false;
    
    // Convert both to strings for comparison
    const normalizedSkillId = skillId.toString();
    return formData.requiredSkills.some(selectedId => selectedId.toString() === normalizedSkillId);
  };

  const priorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
  const categories: TaskCategory[] = ["Tax", "Audit", "Advisory", "Compliance", "Bookkeeping", "Other"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Templates</h2>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-archived"
              checked={showArchived}
              onCheckedChange={handleToggleArchived}
            />
            <label htmlFor="show-archived" className="text-sm font-medium">
              Show Archived
            </label>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading templates...</span>
        </div>
      ) : (
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
                      {template.requiredSkills.map(skillId => {
                        // Find the matching skill name from skills array
                        const skill = skills.find(s => s.id.toString() === skillId.toString());
                        return (
                          <span 
                            key={skillId} 
                            className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800"
                          >
                            {skill ? skill.name : skillId}
                          </span>
                        );
                      })}
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
                    {!template.isArchived && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditTemplate(template)}
                          title="Edit Template"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleArchiveTemplate(template.id)}
                          title="Archive Template"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Task Template' : 'Create New Task Template'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Template Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter template name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || 'Other'}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={isSubmitting}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Describe the task template"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="defaultEstimatedHours" className="text-sm font-medium">
                  Default Estimated Hours
                </label>
                <Input
                  id="defaultEstimatedHours"
                  name="defaultEstimatedHours"
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={formData.defaultEstimatedHours || 1}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="defaultPriority" className="text-sm font-medium">
                  Default Priority
                </label>
                <select
                  id="defaultPriority"
                  name="defaultPriority"
                  value={formData.defaultPriority || 'Medium'}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={isSubmitting}
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Skills</label>
              {isLoadingSkills ? (
                <div className="flex items-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                  <span className="text-sm">Loading skills...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {skills.length > 0 ? (
                    skills.map(skill => {
                      // Debug info to identify skill selection issues
                      const isChecked = isSkillSelected(skill.id);
                      console.log(`Skill ${skill.id} (${skill.name}) selected: ${isChecked}`);
                      
                      return (
                        <div key={skill.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`skill-${skill.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => 
                              handleSkillChange(skill.id, checked === true)
                            }
                            disabled={isSubmitting}
                          />
                          <label htmlFor={`skill-${skill.id}`} className="text-sm">
                            {skill.name}
                            {skill.proficiencyLevel && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({skill.proficiencyLevel})
                              </span>
                            )}
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills found. Please add skills in the Skills Module.</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingTemplate ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingTemplate ? 'Update Template' : 'Create Template'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTemplateList;
