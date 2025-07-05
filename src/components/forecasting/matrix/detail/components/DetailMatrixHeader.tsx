import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, Grid3X3, CheckSquare } from 'lucide-react';
import { useDetailMatrixState } from '../DetailMatrixStateProvider';

interface DetailMatrixHeaderProps {
  taskCount: number;
  selectedCount: number;
}

/**
 * Detail Matrix Header - Phase 2
 * 
 * Header component with view mode toggle and selection controls.
 * Maintains consistent styling with existing matrix components.
 */
export const DetailMatrixHeader: React.FC<DetailMatrixHeaderProps> = ({
  taskCount,
  selectedCount
}) => {
  const { 
    viewMode, 
    setViewMode, 
    selectedTasks,
    clearSelectedTasks 
  } = useDetailMatrixState();

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">View Mode:</span>
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'all-tasks' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('all-tasks')}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4 mr-2" />
                  Show All Tasks
                </Button>
                <Button
                  variant={viewMode === 'group-by-skill' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('group-by-skill')}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Group by Skill
                </Button>
              </div>
            </div>
          </div>

          {/* Task Statistics and Selection */}
          <div className="flex items-center space-x-4">
            {selectedTasks.size > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <CheckSquare className="h-3 w-3" />
                  <span>{selectedTasks.size} selected</span>
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelectedTasks}
                >
                  Clear Selection
                </Button>
              </div>
            )}
            
            <Badge variant="outline" className="text-sm">
              {taskCount} recurring tasks
            </Badge>
          </div>
        </div>

        {/* Mode Description */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-muted-foreground">
            {viewMode === 'all-tasks' 
              ? 'Displaying all recurring tasks in a sortable table view with detailed columns.'
              : 'Tasks grouped by required skill with expandable sections and client distribution summaries.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};