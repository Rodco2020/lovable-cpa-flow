
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
  selectedTemplates: any[];
  selectedClientIds: string[];
  config: AssignmentConfig;
  onConfigChange: (config: AssignmentConfig) => void;
}

export const AssignmentConfiguration: React.FC<AssignmentConfigurationProps> = ({
  selectedTemplates,
  selectedClientIds,
  config,
  onConfigChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Assignment Type</label>
        <select
          value={config.assignmentType}
          onChange={(e) => onConfigChange({
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
          onChange={(e) => onConfigChange({
            ...config,
            customizePerClient: e.target.checked
          })}
        />
        <label htmlFor="customizePerClient" className="text-sm">
          Customize settings per client
        </label>
      </div>

      {config.assignmentType === 'recurring' && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-sm">Recurrence Settings</h4>
          
          <div>
            <label className="block text-sm font-medium mb-2">Recurrence Type</label>
            <select
              value={config.recurrenceType || 'Monthly'}
              onChange={(e) => onConfigChange({
                ...config,
                recurrenceType: e.target.value as any
              })}
              className="w-full p-2 border rounded"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Interval</label>
            <input
              type="number"
              min="1"
              value={config.interval || 1}
              onChange={(e) => onConfigChange({
                ...config,
                interval: parseInt(e.target.value)
              })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="preserveEstimatedHours"
            checked={config.preserveEstimatedHours}
            onChange={(e) => onConfigChange({
              ...config,
              preserveEstimatedHours: e.target.checked
            })}
          />
          <label htmlFor="preserveEstimatedHours" className="text-sm">
            Preserve template estimated hours
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="preserveSkills"
            checked={config.preserveSkills}
            onChange={(e) => onConfigChange({
              ...config,
              preserveSkills: e.target.checked
            })}
          />
          <label htmlFor="preserveSkills" className="text-sm">
            Preserve template skills
          </label>
        </div>

        {config.assignmentType === 'recurring' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="generateImmediately"
              checked={config.generateImmediately}
              onChange={(e) => onConfigChange({
                ...config,
                generateImmediately: e.target.checked
              })}
            />
            <label htmlFor="generateImmediately" className="text-sm">
              Generate first instance immediately
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
