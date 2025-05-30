
import { useCallback } from 'react';
import { ClientMetricsFilters } from '@/types/clientMetrics';

interface UseFilterHandlersProps {
  filters: ClientMetricsFilters;
  onFiltersChange: (filters: ClientMetricsFilters) => void;
  onFilterChange?: (key: keyof ClientMetricsFilters, value: any) => void;
}

/**
 * Custom hook for managing filter change handlers
 * 
 * Encapsulates the logic for handling changes to individual filters
 * while maintaining backwards compatibility with both callback patterns
 */
export const useFilterHandlers = ({
  filters,
  onFiltersChange,
  onFilterChange
}: UseFilterHandlersProps) => {
  const handleIndustryChange = useCallback((value: string) => {
    console.log('Industry change value:', value);
    if (value && value !== 'all') {
      if (onFilterChange) {
        onFilterChange('industry', value);
      } else {
        onFiltersChange({
          ...filters,
          industry: value
        });
      }
    } else {
      const { industry, ...rest } = filters;
      if (onFilterChange) {
        onFilterChange('industry', null);
      } else {
        onFiltersChange(rest);
      }
    }
  }, [filters, onFiltersChange, onFilterChange]);

  const handleStatusChange = useCallback((value: string) => {
    console.log('Status change value:', value);
    if (value && value !== 'all' && (value === 'Active' || value === 'Inactive')) {
      if (onFilterChange) {
        onFilterChange('status', value as 'Active' | 'Inactive');
      } else {
        onFiltersChange({
          ...filters,
          status: value as 'Active' | 'Inactive'
        });
      }
    } else {
      const { status, ...rest } = filters;
      if (onFilterChange) {
        onFilterChange('status', null);
      } else {
        onFiltersChange(rest);
      }
    }
  }, [filters, onFiltersChange, onFilterChange]);

  const handleStaffLiaisonChange = useCallback((value: string) => {
    console.log('Staff liaison change value:', value);
    if (value && value !== 'all') {
      if (onFilterChange) {
        onFilterChange('staffLiaisonId', value);
      } else {
        onFiltersChange({
          ...filters,
          staffLiaisonId: value
        });
      }
    } else {
      const { staffLiaisonId, ...rest } = filters;
      if (onFilterChange) {
        onFilterChange('staffLiaisonId', null);
      } else {
        onFiltersChange(rest);
      }
    }
  }, [filters, onFiltersChange, onFilterChange]);

  return {
    handleIndustryChange,
    handleStatusChange,
    handleStaffLiaisonChange
  };
};
