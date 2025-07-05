import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatHours } from '@/lib/numberUtils';

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

interface DetailMatrixPrintViewProps {
  tasks: Task[];
  viewMode: 'all-tasks' | 'group-by-skill';
  groupingMode: 'skill' | 'client';
  hasActiveFilters: boolean;
  selectedSkills: string[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
}

/**
 * Detail Matrix Print View - Phase 4
 * 
 * Print-optimized view of task-level data with:
 * - Page break-friendly layout
 * - Skill grouping preservation
 * - Header with filter summary on each page
 * - Print-friendly CSS classes
 */
export const DetailMatrixPrintView: React.FC<DetailMatrixPrintViewProps> = ({
  tasks,
  viewMode,
  groupingMode,
  hasActiveFilters,
  selectedSkills,
  selectedClients,
  monthRange
}) => {
  // Group tasks by skill for printing
  const groupedTasks = React.useMemo(() => {
    if (viewMode !== 'group-by-skill') return { 'All Tasks': tasks };
    
    return tasks.reduce((acc, task) => {
      const skill = task.skillRequired;
      if (!acc[skill]) acc[skill] = [];
      acc[skill].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks, viewMode]);

  const printDate = new Date().toLocaleDateString();
  const totalHours = tasks.reduce((sum, task) => sum + task.monthlyHours, 0);

  return (
    <div className="print-view">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .print-view {
            font-size: 12px;
            color: black;
          }
          
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 2px solid #000;
            padding: 10px;
            margin-bottom: 20px;
          }
          
          .print-content {
            margin-top: 100px;
          }
          
          .skill-group {
            page-break-inside: avoid;
            margin-bottom: 30px;
          }
          
          .skill-group:not(:first-child) {
            page-break-before: always;
          }
          
          .task-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .task-table th,
          .task-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          
          .task-table th {
            background: #f0f0f0;
            font-weight: bold;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .no-print {
            display: none;
          }
        }
        
        @media screen {
          .print-view {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
      `}} />

      {/* Print Header - appears on every page */}
      <div className="print-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Detail Matrix Report</h1>
            <p className="text-sm">
              {viewMode === 'all-tasks' ? 'All Tasks View' : 'Grouped by Skill'} • 
              {groupingMode === 'skill' ? ' Skill Mode' : ' Client Mode'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">{printDate}</p>
            <p className="text-sm">{tasks.length} tasks • {formatHours(totalHours, 1)}</p>
          </div>
        </div>
        
        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            <p className="text-xs">
              <strong>Active Filters:</strong>
              {selectedSkills.length > 0 && ` Skills: ${selectedSkills.join(', ')}`}
              {selectedClients.length > 0 && ` • Clients: ${selectedClients.length} selected`}
              {` • Months: ${monthRange.start + 1}-${monthRange.end + 1}`}
            </p>
          </div>
        )}
      </div>

      {/* Print Content */}
      <div className="print-content">
        {Object.entries(groupedTasks).map(([groupName, groupTasks], groupIndex) => (
          <div key={groupName} className="skill-group">
            {/* Group Header */}
            {viewMode === 'group-by-skill' && (
              <div className="mb-4">
                <h2 className="text-lg font-bold border-b-2 border-gray-800 pb-2">
                  {groupName}
                </h2>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>{groupTasks.length} tasks</span>
                  <span>{formatHours(groupTasks.reduce((sum, task) => sum + task.monthlyHours, 0), 1)}</span>
                  <span>{Array.from(new Set(groupTasks.map(task => task.clientName))).length} clients</span>
                </div>
              </div>
            )}

            {/* Tasks Table */}
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Client</th>
                  <th>Skill</th>
                  <th>Hours</th>
                  <th>Month</th>
                  <th>Priority</th>
                  <th>Pattern</th>
                </tr>
              </thead>
              <tbody>
                {groupTasks.map((task, index) => (
                  <tr key={task.id}>
                    <td className="font-medium">{task.taskName}</td>
                    <td>{task.clientName}</td>
                    <td>{task.skillRequired}</td>
                    <td className="text-right">{formatHours(task.monthlyHours, 1)}</td>
                    <td>{task.monthLabel}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded ${
                        task.priority === 'High' ? 'bg-red-100' :
                        task.priority === 'Medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{task.recurrencePattern}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Group Summary */}
            <div className="text-sm text-gray-600 mt-2">
              <strong>Group Total:</strong> {formatHours(groupTasks.reduce((sum, task) => sum + task.monthlyHours, 0), 1)} • 
              {groupTasks.length} tasks • 
              {Array.from(new Set(groupTasks.map(task => task.clientName))).length} unique clients
            </div>
          </div>
        ))}

        {/* Report Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-800">
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h3 className="font-bold mb-2">Summary Statistics</h3>
              <p>Total Tasks: {tasks.length}</p>
              <p>Total Hours: {formatHours(totalHours, 1)}</p>
              <p>Unique Clients: {Array.from(new Set(tasks.map(task => task.clientName))).length}</p>
              <p>Unique Skills: {Array.from(new Set(tasks.map(task => task.skillRequired))).length}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Export Information</h3>
              <p>Generated: {printDate}</p>
              <p>View Mode: {viewMode === 'all-tasks' ? 'All Tasks' : 'Grouped by Skill'}</p>
              <p>Grouping: {groupingMode === 'skill' ? 'Skill-Based' : 'Client-Based'}</p>
              <p>Filters Applied: {hasActiveFilters ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Print utility function to open print dialog with formatted content
 */
export const openDetailMatrixPrint = (props: DetailMatrixPrintViewProps) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to use the print feature');
    return;
  }

  // Create print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Detail Matrix Report - ${new Date().toLocaleDateString()}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
          
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 2px solid #000;
            padding: 15px;
            z-index: 1000;
          }
          
          .print-content {
            margin-top: 120px;
            padding: 20px;
          }
          
          .skill-group {
            page-break-inside: avoid;
            margin-bottom: 40px;
          }
          
          .skill-group:not(:first-child) {
            page-break-before: always;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          
          th {
            background: #f0f0f0;
            font-weight: bold;
          }
          
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .text-sm { font-size: 11px; }
          .text-xs { font-size: 10px; }
          
          .priority-high { background: #fee; color: #800; }
          .priority-medium { background: #ffc; color: #840; }
          .priority-low { background: #efe; color: #080; }
          
          @media print {
            @page { margin: 0.5in; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="font-size: 18px; margin-bottom: 4px;">Detail Matrix Report</h1>
              <p class="text-sm">${props.viewMode === 'all-tasks' ? 'All Tasks View' : 'Grouped by Skill'} • ${props.groupingMode === 'skill' ? 'Skill Mode' : 'Client Mode'}</p>
            </div>
            <div style="text-align: right;">
              <p class="text-sm">${new Date().toLocaleDateString()}</p>
              <p class="text-sm">${props.tasks.length} tasks • ${formatHours(props.tasks.reduce((sum, task) => sum + task.monthlyHours, 0), 1)}</p>
            </div>
          </div>
        </div>
        
        <div class="print-content">
          <!-- Content will be inserted here -->
        </div>
      </body>
    </html>
  `);

  // Add print and close functionality
  printWindow.document.close();
  printWindow.focus();
  
  // Auto-print after short delay
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};