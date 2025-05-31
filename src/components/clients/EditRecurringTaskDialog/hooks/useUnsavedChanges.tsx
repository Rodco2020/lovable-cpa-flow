
import { useState, useEffect, useRef } from 'react';
import { EditTaskFormValues } from '../types';

export const useUnsavedChanges = (form: any, task: any, open: boolean) => {
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);
  const initialFormRef = useRef<any>(null);

  // Store initial form values for detecting changes
  useEffect(() => {
    if (task && open) {
      initialFormRef.current = form.getValues();
    }
  }, [task, open, form]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!initialFormRef.current) return false;
    
    const currentValues = form.getValues();
    const initialValues = initialFormRef.current;
    
    // Compare form values, excluding complex objects like dates that need special comparison
    for (const key in currentValues) {
      if (key === 'dueDate' || key === 'endDate') continue;
      if (JSON.stringify(currentValues[key as keyof EditTaskFormValues]) !== 
          JSON.stringify(initialValues[key])) {
        return true;
      }
    }
    return false;
  };

  const clearInitialForm = () => {
    initialFormRef.current = null;
  };

  return {
    showUnsavedChangesAlert,
    setShowUnsavedChangesAlert,
    hasUnsavedChanges,
    clearInitialForm
  };
};
