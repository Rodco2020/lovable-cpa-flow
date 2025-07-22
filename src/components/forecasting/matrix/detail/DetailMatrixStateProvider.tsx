
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DetailMatrixState {
  viewMode: 'all-tasks' | 'group-by-skill' | 'detail-forecast-matrix' | 'staff-forecast-summary';
  expandedSkills: Set<string>;
  sortConfig: { field: string; direction: 'asc' | 'desc' };
  selectedTasks: Set<string>;
}

interface DetailMatrixContextType extends DetailMatrixState {
  setViewMode: (mode: 'all-tasks' | 'group-by-skill' | 'detail-forecast-matrix' | 'staff-forecast-summary') => void;
  toggleSkillExpansion: (skill: string) => void;
  setSortConfig: (config: { field: string; direction: 'asc' | 'desc' }) => void;
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: (taskIds: string[]) => void;
  clearSelectedTasks: () => void;
}

const DetailMatrixContext = createContext<DetailMatrixContextType | null>(null);

interface DetailMatrixStateProviderProps {
  children: ReactNode;
}

/**
 * Detail Matrix State Provider - Phase 2
 * 
 * Independent state management for Detail Matrix view modes and UI state.
 * Does not interfere with existing Demand Matrix state.
 * Updated to support all view modes including 'staff-forecast-summary'.
 */
export const DetailMatrixStateProvider: React.FC<DetailMatrixStateProviderProps> = ({
  children
}) => {
  const [viewMode, setViewMode] = useState<'all-tasks' | 'group-by-skill' | 'detail-forecast-matrix' | 'staff-forecast-summary'>('all-tasks');
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'taskName',
    direction: 'asc'
  });
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const toggleSkillExpansion = (skill: string) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skill)) {
        newSet.delete(skill);
      } else {
        newSet.add(skill);
      }
      return newSet;
    });
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectAllTasks = (taskIds: string[]) => {
    setSelectedTasks(new Set(taskIds));
  };

  const clearSelectedTasks = () => {
    setSelectedTasks(new Set());
  };

  const contextValue: DetailMatrixContextType = {
    viewMode,
    expandedSkills,
    sortConfig,
    selectedTasks,
    setViewMode,
    toggleSkillExpansion,
    setSortConfig,
    toggleTaskSelection,
    selectAllTasks,
    clearSelectedTasks
  };

  return (
    <DetailMatrixContext.Provider value={contextValue}>
      {children}
    </DetailMatrixContext.Provider>
  );
};

export const useDetailMatrixState = (): DetailMatrixContextType => {
  const context = useContext(DetailMatrixContext);
  if (!context) {
    throw new Error('useDetailMatrixState must be used within DetailMatrixStateProvider');
  }
  return context;
};
