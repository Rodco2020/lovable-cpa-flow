
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Users, Tag } from 'lucide-react';
import { TaskTemplate } from '@/types/task';

interface TemplateBrowserProps {
  templates: TaskTemplate[];
  onSelectTemplate: (templateId: string) => void;
  selectedTemplateIds: string[];
  isLoading?: boolean;
}

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  templates,
  onSelectTemplate,
  selectedTemplateIds,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || template.category === filterCategory;
    const matchesPriority = !filterPriority || template.defaultPriority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority && !template.isArchived;
  });

  // Get unique categories and priorities for filters
  const categories = [...new Set(templates.map(t => t.category))];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            {priorities.map(priority => (
              <SelectItem key={priority} value={priority}>{priority}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredTemplates.map(template => {
          const isSelected = selectedTemplateIds.includes(template.id);
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {isSelected && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {template.defaultEstimatedHours}h
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {template.requiredSkills?.length || 0} skills
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <Badge 
                      variant={template.defaultPriority === 'High' ? 'destructive' : 'secondary'}
                    >
                      {template.defaultPriority}
                    </Badge>
                  </div>

                  {template.requiredSkills && template.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.requiredSkills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {template.requiredSkills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.requiredSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No templates found matching your criteria
        </div>
      )}
    </div>
  );
};
