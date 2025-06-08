
import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TaskExportData } from '@/services/export/exportService';

interface ClientPrintViewProps {
  clientData: {
    legalName: string;
    primaryContact: string;
    email: string;
    phone: string;
    industry: string;
    status: string;
    expectedMonthlyRevenue: number;
  };
  tasks: TaskExportData[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    totalHours: number;
    skillBreakdown: Record<string, number>;
  };
  appliedFilters?: Record<string, any>;
  dateRange?: { start: Date; end: Date };
}

const ClientPrintView: React.FC<ClientPrintViewProps> = ({
  clientData,
  tasks,
  summary,
  appliedFilters,
  dateRange
}) => {
  React.useEffect(() => {
    // Auto-trigger print dialog when component mounts
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-view min-h-screen bg-white p-8 text-black">
      <style>{`
        @media print {
          .print-view {
            font-size: 12px;
            line-height: 1.4;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          .avoid-page-break {
            page-break-inside: avoid;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .header {
            border-bottom: 2px solid #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          .summary-card {
            border: 1px solid #333;
            padding: 15px;
            text-align: center;
          }
          .client-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .filters-section {
            background-color: #f9f9f9;
            padding: 15px;
            border: 1px solid #ddd;
            margin-bottom: 20px;
          }
        }
        @media screen {
          .print-view {
            max-width: 210mm;
            margin: 0 auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="header avoid-page-break">
        <h1 className="text-3xl font-bold mb-2">Client Task Report</h1>
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-gray-700">{clientData.legalName}</h2>
          <p className="text-gray-600">Generated: {formatDate(new Date())}</p>
        </div>
        {dateRange && (
          <p className="text-gray-600 mt-2">
            Report Period: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
          </p>
        )}
      </div>

      {/* Client Information */}
      <div className="client-info avoid-page-break">
        <div>
          <h3 className="text-lg font-semibold mb-3">Client Information</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="font-medium">Legal Name:</td>
                <td>{clientData.legalName}</td>
              </tr>
              <tr>
                <td className="font-medium">Primary Contact:</td>
                <td>{clientData.primaryContact}</td>
              </tr>
              <tr>
                <td className="font-medium">Email:</td>
                <td>{clientData.email}</td>
              </tr>
              <tr>
                <td className="font-medium">Phone:</td>
                <td>{clientData.phone}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Business Details</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="font-medium">Industry:</td>
                <td>{clientData.industry}</td>
              </tr>
              <tr>
                <td className="font-medium">Status:</td>
                <td>{clientData.status}</td>
              </tr>
              <tr>
                <td className="font-medium">Expected Monthly Revenue:</td>
                <td>{formatCurrency(clientData.expectedMonthlyRevenue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Applied Filters */}
      {appliedFilters && Object.keys(appliedFilters).length > 0 && (
        <div className="filters-section avoid-page-break">
          <h3 className="text-lg font-semibold mb-3">Applied Filters</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(appliedFilters).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="summary-grid avoid-page-break">
        <div className="summary-card">
          <div className="text-2xl font-bold">{summary.totalTasks}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="summary-card">
          <div className="text-2xl font-bold">{summary.completedTasks}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="summary-card">
          <div className="text-2xl font-bold">{summary.activeTasks}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="summary-card">
          <div className="text-2xl font-bold">{summary.totalHours}h</div>
          <div className="text-sm text-gray-600">Total Hours</div>
        </div>
      </div>

      {/* Skills Breakdown */}
      {Object.keys(summary.skillBreakdown).length > 0 && (
        <div className="avoid-page-break">
          <h3 className="text-lg font-semibold mb-3">Skills Breakdown</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th>Skill</th>
                <th className="text-right">Total Hours</th>
                <th className="text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.skillBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([skill, hours]) => (
                  <tr key={skill}>
                    <td>{skill}</td>
                    <td className="text-right">{hours.toFixed(1)}h</td>
                    <td className="text-right">
                      {((hours / summary.totalHours) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Details */}
      <div className="page-break">
        <h3 className="text-lg font-semibold mb-3">Task Details</h3>
        
        {/* Recurring Tasks */}
        {tasks.filter(t => t.taskType === 'Recurring').length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Recurring Tasks</h4>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th className="text-right">Est. Hours</th>
                  <th>Required Skills</th>
                  <th>Next Due</th>
                </tr>
              </thead>
              <tbody>
                {tasks
                  .filter(task => task.taskType === 'Recurring')
                  .map((task, index) => (
                    <tr key={task.id} className={index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}>
                      <td>{task.taskName}</td>
                      <td>{task.status}</td>
                      <td>{task.priority}</td>
                      <td className="text-right">{task.estimatedHours}h</td>
                      <td>{task.requiredSkills.join(', ')}</td>
                      <td>{task.nextDueDate ? formatDate(new Date(task.nextDueDate)) : 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ad-hoc Tasks */}
        {tasks.filter(t => t.taskType === 'Ad-hoc').length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-2">Ad-hoc Tasks</h4>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th className="text-right">Est. Hours</th>
                  <th>Required Skills</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks
                  .filter(task => task.taskType === 'Ad-hoc')
                  .map((task, index) => (
                    <tr key={task.id} className={index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}>
                      <td>{task.taskName}</td>
                      <td>{task.status}</td>
                      <td>{task.priority}</td>
                      <td className="text-right">{task.estimatedHours}h</td>
                      <td>{task.requiredSkills.join(', ')}</td>
                      <td>{task.nextDueDate ? formatDate(new Date(task.nextDueDate)) : 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
        <p>CPA Practice Management Software - Generated on {formatDate(new Date())}</p>
        <p>This report contains {summary.totalTasks} tasks with {summary.totalHours} total estimated hours</p>
      </div>
    </div>
  );
};

export default ClientPrintView;
