
import React from 'react';
import { TaskPriority } from '@/types/task';

/**
 * Assignment Configuration Interface
 * 
 * Defines the structure for task assignment configuration including
 * assignment type, task settings, and recurrence patterns.
 */
export interface AssignmentConfig {
  // Basic assignment settings
  assignmentType: 'ad-hoc' | 'recurring';
  customizePerClient: boolean;
  
  // Task configuration
  taskType?: 'adhoc' | 'recurring';
  priority?: TaskPriority;
  estimatedHours?: number;
  dueDate?: Date;
  
  // Recurrence settings
  recurrenceType?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  interval?: number;
  weekdays?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  
  // Recurrence pattern (for compatibility)
  recurrencePattern?: {
    type: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
    interval: number;
    weekdays?: number[];
    dayOfMonth?: number;
    monthOfYear?: number;
  };
  
  // Preservation options
  preserveEstimatedHours: boolean;
  preserveSkills: boolean;
  generateImmediately: boolean;
}

/**
 * Assignment Configuration Component
 * 
 * Provides configuration options for task assignments including
 * assignment type selection and client customization settings.
 */
interface AssignmentConfigurationProps {
  config: AssignmentConfig;
  onChange: (config: AssignmentConfig) => void;
}

export const AssignmentConfiguration: React.FC<AssignmentConfigurationProps> = ({
  config,
  onChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Assignment Type</label>
        <select
          value={config.assignmentType}
          onChange={(e) => onChange({
            ...config,
            assignmentType: e.target.value as 'ad-hoc' | 'recurring'
          })}
          className="w-full p-2 border rounded"
        >
          <option value="ad-hoc">Ad-hoc Tasks</option>
          <option value="recurring">Recurring Tasks</option>
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="customizePerClient"
          checked={config.customizePerClient}
          onChange={(e) => onChange({
            ...config,
            customizePerClient: e.target.checked
          })}
        />
        <label htmlFor="customizePerClient" className="text-sm">
          Customize settings per client
        </label>
      </div>
    </div>
  );
};
