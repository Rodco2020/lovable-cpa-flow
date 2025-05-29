
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';
import { useEnhancedTaskSelection } from './hooks/useEnhancedTaskSelection';
import { AdvancedSearchFilter } from './components/AdvancedSearchFilter';
import { BulkSelectionControls } from './components/BulkSelectionControls';
import { EnhancedTaskSelectionList } from './components/EnhancedTaskSelectionList';

interface SelectTasksStepEnhancedProps {
  clientId: string;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  sourceClientName: string;
}

export const SelectTasksStepEnhanced: React.FC<SelectTasksStepEnhancedProps> = ({
  clientId,
  selectedTaskIds,
  setSelectedTaskIds,
  sourceClientName
}) => {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  const {
    // Search and filters
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Data
    filteredTasks,
    recurringTasksCount,
    adHocTasksCount,
    availableCategories,
    availablePriorities,

    // State
    isLoading,
    hasError
  } = useEnhancedTaskSelection(clientId);

  const handleSelectAll = () => {
    const allTaskIds = filteredTasks.map(task => task.id);
    setSelectedTaskIds(allTaskIds);
  };

  const handleDeselectAll = () => {
    setSelectedTaskIds([]);
  };

  const handleClearFilters = () => {
    setActiveFilter('all');
    setCategoryFilter('');
    setPriorityFilter('');
    setSearchTerm('');
  };

  const handleToggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(
      selectedTaskIds.includes(taskId)
        ? selectedTaskIds.filter(id => id !== taskId)
        : [...selectedTaskIds, taskId]
    );
  };

  const hasActiveFilters = categoryFilter || priorityFilter || activeFilter !== 'all' || searchTerm;

  if (hasError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load tasks. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Copy className="h-5 w-5" />
            <span>Select Tasks from {sourceClientName}</span>
            {selectedTaskIds.length > 0 && (
              <Badge variant="secondary">
                {selectedTaskIds.length} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enhanced Search and Filters */}
          <AdvancedSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            availableCategories={availableCategories}
            availablePriorities={availablePriorities}
            onClearFilters={handleClearFilters}
            hasActiveFilters={!!hasActiveFilters}
          />

          {/* Bulk Selection Controls */}
          <BulkSelectionControls
            tasks={filteredTasks}
            selectedTaskIds={selectedTaskIds}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onToggleTask={handleToggleTaskSelection}
            totalCount={filteredTasks.length}
            isKeyboardMode={isKeyboardMode}
            onToggleKeyboardMode={() => setIsKeyboardMode(!isKeyboardMode)}
          />

          {/* Enhanced Task List */}
          <EnhancedTaskSelectionList
            tasks={filteredTasks}
            selectedTaskIds={selectedTaskIds}
            onToggleTask={handleToggleTaskSelection}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
