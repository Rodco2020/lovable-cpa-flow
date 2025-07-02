import React, { useMemo } from 'react';
import { Staff } from '@/types/staff';

interface PreferredStaffFilterOptimizerProps {
  tasks: any[];
  staffOptions: Staff[];
  children: (optimizedData: {
    validStaffIds: Set<string>;
    activeStaffMap: Map<string, Staff>;
    hasInactivePreferredStaff: boolean;
  }) => React.ReactNode;
}

/**
 * Performance optimization component for Preferred Staff filtering
 * 
 * This component memoizes expensive calculations related to staff filtering
 * to prevent unnecessary re-renders and improve performance with large datasets.
 * 
 * Phase 3 Integration: Performance Optimization
 */
export const PreferredStaffFilterOptimizer: React.FC<PreferredStaffFilterOptimizerProps> = ({
  tasks,
  staffOptions,
  children
}) => {
  const optimizedData = useMemo(() => {
    // Create a Set of valid staff IDs for O(1) lookup performance
    const validStaffIds = new Set(staffOptions.map(staff => staff.id));
    
    // Create a Map for efficient staff lookup by ID
    const activeStaffMap = new Map(
      staffOptions.map(staff => [staff.id, staff])
    );
    
    // Check if any tasks reference inactive/deleted staff
    const hasInactivePreferredStaff = tasks.some(task => 
      task.preferredStaffId && 
      task.preferredStaffId !== 'all' && 
      !validStaffIds.has(task.preferredStaffId)
    );
    
    return {
      validStaffIds,
      activeStaffMap,
      hasInactivePreferredStaff
    };
  }, [tasks, staffOptions]);

  return <>{children(optimizedData)}</>;
};