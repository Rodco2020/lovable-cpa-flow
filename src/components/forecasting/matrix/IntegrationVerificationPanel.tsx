import React, { useState, useEffect } from 'react';
import { RecurringTaskDB } from '@/types/task';
import { StaffOption } from '@/types/staff';

interface IntegrationVerificationPanelProps {
  recurringTasks: RecurringTaskDB[];
  staffOptions: StaffOption[];
}

const mockRecurringTasks: RecurringTaskDB[] = [
  {
    id: '1',
    name: 'Monthly Tax Review',
    template_id: 'template-1',
    client_id: 'client-1',
    estimated_hours: 4,
    required_skills: ['Tax Prep', 'CPA'],
    recurrence_type: 'Monthly',
    recurrence_interval: 1,
    weekdays: [1, 3, 5],
    day_of_month: 15,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    is_active: true,
    preferred_staff_id: null, // Add missing field
    description: 'Monthly tax review process',
    priority: 'High',
    category: 'Tax',
    status: 'Unscheduled',
    due_date: null,
    last_generated_date: null,
    notes: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Quarterly Audit Prep',
    template_id: 'template-2',
    client_id: 'client-2',
    estimated_hours: 8,
    required_skills: ['Auditing', 'GAAP'],
    recurrence_type: 'Quarterly',
    recurrence_interval: 3,
    weekdays: [2, 4],
    day_of_month: 20,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    is_active: true,
    preferred_staff_id: null, // Add missing field
    description: 'Preparing for quarterly audits',
    priority: 'Medium',
    category: 'Audit',
    status: 'Unscheduled',
    due_date: null,
    last_generated_date: null,
    notes: null,
    created_at: '2023-02-15T00:00:00Z',
    updated_at: '2023-02-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'Annual Financial Planning',
    template_id: 'template-3',
    client_id: 'client-3',
    estimated_hours: 16,
    required_skills: ['Financial Planning', 'Excel'],
    recurrence_type: 'Annually',
    recurrence_interval: 12,
    weekdays: [0, 6],
    day_of_month: 1,
    month_of_year: 1,
    end_date: null,
    custom_offset_days: null,
    is_active: true,
    preferred_staff_id: null, // Add missing field
    description: 'Comprehensive annual financial planning',
    priority: 'High',
    category: 'Advisory',
    status: 'Unscheduled',
    due_date: null,
    last_generated_date: null,
    notes: null,
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2023-03-01T00:00:00Z'
  }
];

const mockStaffOptions: StaffOption[] = [
  { id: 'staff-1', full_name: 'Alice Smith' },
  { id: 'staff-2', full_name: 'Bob Johnson' },
  { id: 'staff-3', full_name: 'Charlie Brown' }
];

const IntegrationVerificationPanel: React.FC<IntegrationVerificationPanelProps> = ({ recurringTasks = mockRecurringTasks, staffOptions = mockStaffOptions }) => {
  const [selectedTask, setSelectedTask] = useState<RecurringTaskDB | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffOption | null>(null);
  const [isTaskActive, setIsTaskActive] = useState(true);

  useEffect(() => {
    if (selectedTask) {
      setIsTaskActive(selectedTask.is_active);
    }
  }, [selectedTask]);

  const handleTaskSelection = (taskId: string) => {
    const task = recurringTasks.find(task => task.id === taskId);
    setSelectedTask(task || null);
  };

  const handleStaffSelection = (staffId: string) => {
    const staff = staffOptions.find(staff => staff.id === staffId);
    setSelectedStaff(staff || null);
  };

  const handleToggleTaskStatus = () => {
    if (selectedTask) {
      setIsTaskActive(!isTaskActive);
    }
  };

  const handleSaveAssignment = () => {
    if (selectedTask && selectedStaff) {
      alert(`Task "${selectedTask.name}" assigned to staff "${selectedStaff.full_name}"`);
    } else {
      alert('Please select both a task and a staff member.');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Integration Verification Panel</h2>

      {/* Task Selection */}
      <div className="space-y-2">
        <label htmlFor="taskSelect" className="block text-sm font-medium text-gray-700">
          Select Recurring Task:
        </label>
        <select
          id="taskSelect"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          onChange={(e) => handleTaskSelection(e.target.value)}
          value={selectedTask?.id || ''}
        >
          <option value="">-- Select a task --</option>
          {recurringTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name}
            </option>
          ))}
        </select>
      </div>

      {/* Staff Selection */}
      <div className="space-y-2">
        <label htmlFor="staffSelect" className="block text-sm font-medium text-gray-700">
          Select Staff Member:
        </label>
        <select
          id="staffSelect"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          onChange={(e) => handleStaffSelection(e.target.value)}
          value={selectedStaff?.id || ''}
        >
          <option value="">-- Select a staff member --</option>
          {staffOptions.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Task Details */}
      {selectedTask && (
        <div className="border rounded-md p-4 space-y-2">
          <h3 className="text-lg font-medium">Task Details</h3>
          <p>Name: {selectedTask.name}</p>
          <p>Description: {selectedTask.description}</p>
          <p>Estimated Hours: {selectedTask.estimated_hours}</p>
          <p>Priority: {selectedTask.priority}</p>
          <p>Category: {selectedTask.category}</p>
          <p>Recurrence Type: {selectedTask.recurrence_type}</p>
          <p>Is Active: {selectedTask.is_active ? 'Yes' : 'No'}</p>
        </div>
      )}

      {/* Toggle Task Status */}
      {selectedTask && (
        <div className="space-x-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleToggleTaskStatus}
          >
            {isTaskActive ? 'Deactivate Task' : 'Activate Task'}
          </button>
        </div>
      )}

      {/* Save Assignment */}
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSaveAssignment}
      >
        Save Assignment
      </button>
    </div>
  );
};

export default IntegrationVerificationPanel;
