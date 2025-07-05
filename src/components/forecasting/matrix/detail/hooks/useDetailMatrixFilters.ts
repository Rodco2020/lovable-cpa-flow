import { useDetailMatrixFiltering } from './useDetailMatrixFiltering';

interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
}

interface UseDetailMatrixFiltersProps {
  tasks: Task[];
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: (string | number | null | undefined)[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

interface UseDetailMatrixFiltersResult {
  filteredTasks: Task[];
  filterStats: {
    originalCount: number;
    filteredCount: number;
    skillsFiltered: number;
    clientsFiltered: number;
    staffFiltered: number;
    monthRangeFiltered: number;
  };
  hasActiveFilters: boolean;
  activeFiltersCount: number;
}

/**
 * Detail Matrix Filters Hook - Step 2
 * 
 * Wraps the existing filtering logic and provides filtered data.
 * Maintains exact same filtering behavior as original container.
 */
export const useDetailMatrixFilters = ({
  tasks,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  monthRange,
  groupingMode
}: UseDetailMatrixFiltersProps): UseDetailMatrixFiltersResult => {
  
  // Use existing filtering hook with proper type conversion
  const filterResult = useDetailMatrixFiltering({
    tasks,
    selectedSkills,
    selectedClients,
    selectedPreferredStaff: selectedPreferredStaff.filter(staff => staff != null).map(String),
    monthRange,
    groupingMode
  });

  return {
    filteredTasks: filterResult.filteredTasks,
    filterStats: filterResult.filterStats,
    hasActiveFilters: filterResult.hasActiveFilters,
    activeFiltersCount: filterResult.activeFiltersCount
  };
};