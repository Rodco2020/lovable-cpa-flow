
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface ViewToggleSectionProps {
  activeView: 'tasks' | 'dashboard';
  onViewChange: (value: 'tasks' | 'dashboard') => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
}

/**
 * ViewToggleSection Component
 * 
 * Handles the view switching between Tasks View and Dashboard View,
 * as well as the toggle between simple and advanced filters.
 */
export const ViewToggleSection: React.FC<ViewToggleSectionProps> = ({
  activeView,
  onViewChange,
  showAdvancedFilters,
  onToggleAdvancedFilters
}) => {
  return (
    <div className="flex items-center justify-between">
      <Tabs value={activeView} onValueChange={onViewChange}>
        <TabsList>
          <TabsTrigger value="tasks">Tasks View</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard View</TabsTrigger>
        </TabsList>
      </Tabs>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleAdvancedFilters}
      >
        {showAdvancedFilters ? 'Simple Filters' : 'Advanced Filters'}
      </Button>
    </div>
  );
};
