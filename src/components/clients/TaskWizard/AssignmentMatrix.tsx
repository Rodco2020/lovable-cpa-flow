
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Grid, 
  Eye, 
  EyeOff, 
  CheckSquare, 
  Square, 
  RotateCcw,
  Download
} from 'lucide-react';
import { Client } from '@/types/client';
import { TaskTemplate } from '@/types/task';

interface AssignmentMatrix {
  [clientId: string]: {
    [templateId: string]: boolean;
  };
}

interface AssignmentMatrixProps {
  clients: Client[];
  templates: TaskTemplate[];
  assignments: AssignmentMatrix;
  onAssignmentChange: (assignments: AssignmentMatrix) => void;
  isReadOnly?: boolean;
}

export const AssignmentMatrix: React.FC<AssignmentMatrixProps> = ({
  clients,
  templates,
  assignments,
  onAssignmentChange,
  isReadOnly = false
}) => {
  const [showClientDetails, setShowClientDetails] = useState(true);
  const [showTemplateDetails, setShowTemplateDetails] = useState(true);

  // Calculate totals
  const clientTotals = clients.map(client => {
    const assigned = templates.filter(template => 
      assignments[client.id]?.[template.id]
    ).length;
    return { clientId: client.id, count: assigned };
  });

  const templateTotals = templates.map(template => {
    const assigned = clients.filter(client => 
      assignments[client.id]?.[template.id]
    ).length;
    return { templateId: template.id, count: assigned };
  });

  const totalAssignments = clientTotals.reduce((sum, total) => sum + total.count, 0);

  const toggleAssignment = (clientId: string, templateId: string) => {
    if (isReadOnly) return;

    const newAssignments = { ...assignments };
    if (!newAssignments[clientId]) {
      newAssignments[clientId] = {};
    }
    newAssignments[clientId][templateId] = !newAssignments[clientId][templateId];
    onAssignmentChange(newAssignments);
  };

  const toggleClientAll = (clientId: string) => {
    if (isReadOnly) return;

    const newAssignments = { ...assignments };
    if (!newAssignments[clientId]) {
      newAssignments[clientId] = {};
    }

    const currentCount = templates.filter(template => 
      newAssignments[clientId][template.id]
    ).length;
    const shouldSelectAll = currentCount < templates.length;

    templates.forEach(template => {
      newAssignments[clientId][template.id] = shouldSelectAll;
    });

    onAssignmentChange(newAssignments);
  };

  const toggleTemplateAll = (templateId: string) => {
    if (isReadOnly) return;

    const newAssignments = { ...assignments };
    const currentCount = clients.filter(client => 
      newAssignments[client.id]?.[templateId]
    ).length;
    const shouldSelectAll = currentCount < clients.length;

    clients.forEach(client => {
      if (!newAssignments[client.id]) {
        newAssignments[client.id] = {};
      }
      newAssignments[client.id][templateId] = shouldSelectAll;
    });

    onAssignmentChange(newAssignments);
  };

  const clearAll = () => {
    if (isReadOnly) return;
    onAssignmentChange({});
  };

  const selectAll = () => {
    if (isReadOnly) return;
    const newAssignments: AssignmentMatrix = {};
    clients.forEach(client => {
      newAssignments[client.id] = {};
      templates.forEach(template => {
        newAssignments[client.id][template.id] = true;
      });
    });
    onAssignmentChange(newAssignments);
  };

  const exportMatrix = () => {
    const data = clients.map(client => {
      const row: any = { 
        'Client Name': client.legalName,
        'Industry': client.industry,
        'Revenue': client.expectedMonthlyRevenue
      };
      templates.forEach(template => {
        row[template.name] = assignments[client.id]?.[template.id] ? 'Yes' : 'No';
      });
      return row;
    });

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Grid className="h-5 w-5" />
            <span>Assignment Matrix</span>
            <Badge variant="outline">{totalAssignments} assignments</Badge>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClientDetails(!showClientDetails)}
            >
              {showClientDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Client Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateDetails(!showTemplateDetails)}
            >
              {showTemplateDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Template Details
            </Button>
            <Button variant="outline" size="sm" onClick={exportMatrix}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isReadOnly && (
          <div className="flex space-x-2 mb-4">
            <Button variant="outline" size="sm" onClick={selectAll}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Square className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAssignmentChange({})}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        )}

        <ScrollArea className="h-96 w-full">
          <div className="relative">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 bg-background border border-border p-2 text-left font-medium z-20">
                    Client / Template
                  </th>
                  {templates.map(template => {
                    const total = templateTotals.find(t => t.templateId === template.id)?.count || 0;
                    return (
                      <th 
                        key={template.id}
                        className="sticky top-0 bg-background border border-border p-2 text-center font-medium z-10 min-w-32"
                      >
                        <div className="space-y-1">
                          {!isReadOnly && (
                            <Checkbox
                              checked={total === clients.length}
                              onCheckedChange={() => toggleTemplateAll(template.id)}
                              className="mx-auto"
                            />
                          )}
                          <div className="text-xs font-medium truncate">{template.name}</div>
                          {showTemplateDetails && (
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {template.defaultEstimatedHours}h
                              </div>
                            </div>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {total}/{clients.length}
                          </Badge>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {clients.map(client => {
                  const total = clientTotals.find(t => t.clientId === client.id)?.count || 0;
                  return (
                    <tr key={client.id}>
                      <td className="sticky left-0 bg-background border border-border p-2 z-10">
                        <div className="flex items-center space-x-2">
                          {!isReadOnly && (
                            <Checkbox
                              checked={total === templates.length}
                              onCheckedChange={() => toggleClientAll(client.id)}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{client.legalName}</div>
                            {showClientDetails && (
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  {client.industry}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ${client.expectedMonthlyRevenue?.toLocaleString()}/mo
                                </div>
                              </div>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {total}/{templates.length}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      {templates.map(template => {
                        const isAssigned = assignments[client.id]?.[template.id] || false;
                        return (
                          <td 
                            key={template.id}
                            className="border border-border p-2 text-center"
                          >
                            <Checkbox
                              checked={isAssigned}
                              onCheckedChange={() => toggleAssignment(client.id, template.id)}
                              disabled={isReadOnly}
                              className="mx-auto"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
