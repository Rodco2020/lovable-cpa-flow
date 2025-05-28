
import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Component for displaying loading state while resources are being fetched
 */
const TaskFormHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Loading resources...</p>
    </div>
  );
};

export default TaskFormHeader;
