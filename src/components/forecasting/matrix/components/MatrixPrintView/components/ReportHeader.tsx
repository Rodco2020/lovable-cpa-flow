
import React from 'react';
import { formatDate } from '@/lib/utils';
import { ReportHeaderProps } from '../types';

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  filteredMonths,
  selectedSkills,
  selectedClientIds,
  clientNames,
  printOptions
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-2">Capacity Matrix Report</h1>
      <p className="text-gray-600">Generated on: {formatDate(new Date())}</p>
      
      {/* Report Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Time Period:</strong> {filteredMonths[0]?.label} - {filteredMonths[filteredMonths.length - 1]?.label}
        </div>
        <div>
          <strong>Skills:</strong> {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'All skills'}
        </div>
        {printOptions.includeClientFilter && selectedClientIds.length > 0 && (
          <div className="col-span-2">
            <strong>Filtered Clients:</strong> {selectedClientIds.map(id => clientNames[id] || id).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};
