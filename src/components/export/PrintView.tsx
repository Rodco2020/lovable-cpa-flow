
import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ClientExportData, TaskExportData } from '@/services/export/exportService';

interface PrintViewProps {
  title: string;
  data: ClientExportData[] | TaskExportData[];
  dataType: 'clients' | 'tasks';
  appliedFilters?: Record<string, any>;
  onPrint: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({
  title,
  data,
  dataType,
  appliedFilters,
  onPrint
}) => {
  React.useEffect(() => {
    // Auto-trigger print dialog when component mounts
    const timer = setTimeout(() => {
      onPrint();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onPrint]);

  return (
    <div className="print-view min-h-screen bg-white p-8">
      <style jsx>{`
        @media print {
          .print-view {
            font-size: 12px;
            line-height: 1.4;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">Generated on: {formatDate(new Date())}</p>
        
        {/* Applied Filters */}
        {appliedFilters && Object.keys(appliedFilters).length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Applied Filters:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {Object.entries(appliedFilters).map(([key, value]) => (
                value && (
                  <li key={key}>• {key}: {value}</li>
                )
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Data Table */}
      {dataType === 'clients' ? (
        <ClientsTable clients={data as ClientExportData[]} />
      ) : (
        <TasksTable tasks={data as TaskExportData[]} />
      )}
      
      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
        <p>CPA Practice Management Software - Generated Report</p>
      </div>
    </div>
  );
};

const ClientsTable: React.FC<{ clients: ClientExportData[] }> = ({ clients }) => (
  <table className="w-full border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-50">
        <th className="border border-gray-300 p-2">Client Name</th>
        <th className="border border-gray-300 p-2">Primary Contact</th>
        <th className="border border-gray-300 p-2">Email</th>
        <th className="border border-gray-300 p-2">Industry</th>
        <th className="border border-gray-300 p-2">Status</th>
        <th className="border border-gray-300 p-2">Monthly Revenue</th>
        <th className="border border-gray-300 p-2">Staff Liaison</th>
      </tr>
    </thead>
    <tbody>
      {clients.map((client, index) => (
        <tr key={client.id} className={index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}>
          <td className="border border-gray-300 p-2">{client.legalName}</td>
          <td className="border border-gray-300 p-2">{client.primaryContact}</td>
          <td className="border border-gray-300 p-2">{client.email}</td>
          <td className="border border-gray-300 p-2">{client.industry}</td>
          <td className="border border-gray-300 p-2">{client.status}</td>
          <td className="border border-gray-300 p-2">{formatCurrency(client.expectedMonthlyRevenue)}</td>
          <td className="border border-gray-300 p-2">{client.staffLiaisonName || 'N/A'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TasksTable: React.FC<{ tasks: TaskExportData[] }> = ({ tasks }) => (
  <table className="w-full border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-50">
        <th className="border border-gray-300 p-2">Client Name</th>
        <th className="border border-gray-300 p-2">Task Name</th>
        <th className="border border-gray-300 p-2">Type</th>
        <th className="border border-gray-300 p-2">Status</th>
        <th className="border border-gray-300 p-2">Priority</th>
        <th className="border border-gray-300 p-2">Est. Hours</th>
        <th className="border border-gray-300 p-2">Required Skills</th>
        <th className="border border-gray-300 p-2">Next Due Date</th>
      </tr>
    </thead>
    <tbody>
      {tasks.map((task, index) => (
        <tr key={task.id} className={index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}>
          <td className="border border-gray-300 p-2">{task.clientName}</td>
          <td className="border border-gray-300 p-2">{task.taskName}</td>
          <td className="border border-gray-300 p-2">{task.taskType}</td>
          <td className="border border-gray-300 p-2">{task.status}</td>
          <td className="border border-gray-300 p-2">{task.priority}</td>
          <td className="border border-gray-300 p-2">{task.estimatedHours}</td>
          <td className="border border-gray-300 p-2">{task.requiredSkills.join(', ')}</td>
          <td className="border border-gray-300 p-2">{task.nextDueDate || 'N/A'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
