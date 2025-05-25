
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Save, 
  RotateCcw,
  Plus,
  X,
  Clock,
  Star,
  Tag
} from 'lucide-react';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';
import { useQuery } from '@tanstack/react-query';
import { getAllSkills } from '@/services/skillService';

interface TemplateCustomizerProps {
  initialTemplate: Partial<TaskTemplate>;
  onCustomizationComplete: (templateData: Partial<TaskTemplate>) => void;
}

const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORY_OPTIONS: TaskCategory[] = ['Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other'];

export const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
  initialTemplate,
  onCustomizationComplete
}) => {
  const [template, setTemplate] = useState<Partial<TaskTemplate>>(initialTemplate);
  const [newSkill, setNewSkill] = useState('');

  // Fetch available skills
  const { data: availableSkills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills,
  });

  const handleFieldChange = (field: keyof TaskTemplate, value: any) => {
    setTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillToggle = (skillId: string, checked: boolean) => {
    const currentSkills = template.requiredSkills || [];
    if (checked) {
      if (!currentSkills.includes(skillId)) {
        handleFieldChange('requiredSkills', [...currentSkills, skillId]);
      }
    } else {
      handleFieldChange('requiredSkills', currentSkills.filter(s => s !== skillId));
    }
  };

  const handleAddCustomSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = template.requiredSkills || [];
      if (!currentSkills.includes(newSkill.trim())) {
        handleFieldChange('requiredSkills', [...currentSkills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = template.requiredSkills || [];
    handleFieldChange('requiredSkills', currentSkills.filter(s => s !== skillToRemove));
  };

  const handleReset = () => {
    setTemplate(initialTemplate);
  };

  const handleSave = () => {
    onCustomizationComplete(template);
  };

  const isValidTemplate = () => {
    return template.name?.trim() && 
           template.description?.trim() && 
           template.defaultEstimatedHours && 
           template.defaultEstimatedHours > 0 &&
           template.defaultPriority &&
           template.category;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Customize Template</h3>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!isValidTemplate()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Template Name *</label>
            <Input
              value={template.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Description *</label>
            <Textarea
              value={template.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Task Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Default Estimated Hours *</label>
              <Input
                type="number"
                min="0.25"
                step="0.25"
                value={template.defaultEstimatedHours || ''}
                onChange={(e) => handleFieldChange('defaultEstimatedHours', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Default Priority *</label>
              <select
                value={template.defaultPriority || ''}
                onChange={(e) => handleFieldChange('defaultPriority', e.target.value as TaskPriority)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Select priority</option>
                {PRIORITY_OPTIONS.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category *</label>
            <select
              value={template.category || ''}
              onChange={(e) => handleFieldChange('category', e.target.value as TaskCategory)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Skills Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Required Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Skills */}
          <div>
            <label className="text-sm font-medium mb-2 block">Selected Skills</label>
            <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md bg-muted/50">
              {template.requiredSkills && template.requiredSkills.length > 0 ? (
                template.requiredSkills.map(skillId => {
                  const skill = availableSkills.find(s => s.id === skillId);
                  const skillName = skill ? skill.name : skillId;
                  return (
                    <Badge key={skillId} variant="secondary" className="flex items-center gap-1">
                      {skillName}
                      <button
                        onClick={() => handleRemoveSkill(skillId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })
              ) : (
                <span className="text-sm text-muted-foreground">No skills selected</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Available Skills */}
          <div>
            <label className="text-sm font-medium mb-2 block">Available Skills</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {availableSkills.map(skill => {
                const isSelected = template.requiredSkills?.includes(skill.id) || false;
                return (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSkillToggle(skill.id, checked as boolean)}
                    />
                    <span className="text-sm">{skill.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Add Custom Skill */}
          <div>
            <label className="text-sm font-medium mb-2 block">Add Custom Skill</label>
            <div className="flex space-x-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter skill name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddCustomSkill}
                disabled={!newSkill.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{template.name || 'Untitled Template'}</span>
              <div className="flex space-x-2">
                <Badge variant="outline">{template.category || 'No Category'}</Badge>
                <Badge variant="outline">{template.defaultPriority || 'No Priority'}</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {template.description || 'No description provided'}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span>Estimated Hours: <strong>{template.defaultEstimatedHours || 0}h</strong></span>
              <span>Required Skills: <strong>{template.requiredSkills?.length || 0}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
