
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getTaskTemplates } from '@/services/taskService';

const TaskTemplateList: React.FC = () => {
  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['task-templates'],
    queryFn: () => getTaskTemplates(),
  });

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  if (error) {
    return <div>Error loading templates: {String(error)}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {templates.map((template) => (
            <div key={template.id} className="p-3 border rounded">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
              <div className="text-xs text-gray-500 mt-1">
                {template.defaultEstimatedHours}h • {template.category} • {template.defaultPriority}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskTemplateList;
