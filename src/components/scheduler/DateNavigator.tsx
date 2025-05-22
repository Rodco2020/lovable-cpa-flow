
import { useState } from 'react';
import { addDays } from 'date-fns';

/**
 * Hook for managing date navigation in the scheduler
 */
export const useDateNavigator = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Navigate between days
  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1)
    );
  };
  
  return {
    currentDate,
    setCurrentDate,
    navigateDay
  };
};
