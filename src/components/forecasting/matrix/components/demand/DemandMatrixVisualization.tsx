
/**
 * Demand Matrix Visualization Component
 * Displays the demand matrix data in a visual format
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DemandMatrixData } from '@/types/demand';

interface DemandMatrixVisualizationProps {
  data: DemandMatrixData;
  groupingMode: 'skill' | 'client';
  onGroupingModeChange: (mode: 'skill' | 'client') => void;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  monthRange: { start: number; end: number };
}

export const DemandMatrixVisualization: React.FC<DemandMatrixVisualizationProps> = ({
  data,
  groupingMode,
  onGroupingModeChange,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange
}) => {
  const filteredMonths = data.months.slice(monthRange.start, monthRange.end + 1);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Demand Matrix - {groupingMode === 'skill' ? 'By Skills' : 'By Clients'}</span>
          <div className="flex gap-2">
            <Button
              variant={groupingMode === 'skill' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGroupingModeChange('skill')}
            >
              Skills
            </Button>
            <Button
              variant={groupingMode === 'client' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGroupingModeChange('client')}
            >
              Clients
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.totalDemand || 0}</div>
              <div className="text-sm text-blue-500">Total Hours</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.totalTasks || 0}</div>
              <div className="text-sm text-green-500">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.skills.length}</div>
              <div className="text-sm text-purple-500">Skills</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{filteredMonths.length}</div>
              <div className="text-sm text-orange-500">Months</div>
            </div>
          </div>
          
          {/* Applied Filters */}
          {(selectedSkills.length > 0 || selectedClients.length > 0 || selectedPreferredStaff.length > 0) && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Applied Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skill => (
                  <Badge key={skill} variant="secondary">Skill: {skill}</Badge>
                ))}
                {selectedClients.map(client => (
                  <Badge key={client} variant="secondary">Client: {client}</Badge>
                ))}
                {selectedPreferredStaff.map(staff => (
                  <Badge key={staff} variant="secondary">Staff: {staff}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Matrix Grid Placeholder */}
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            <p>Matrix visualization would be rendered here</p>
            <p className="text-sm mt-2">
              Showing {data.dataPoints.length} data points across {filteredMonths.length} months
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
