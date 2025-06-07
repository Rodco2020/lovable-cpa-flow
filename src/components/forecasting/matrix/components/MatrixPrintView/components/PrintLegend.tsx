
import React from 'react';

export const PrintLegend: React.FC = () => {
  return (
    <div className="mt-6 text-xs">
      <h3 className="font-semibold mb-2">Legend:</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border"></div>
          <span>Capacity (available hours)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border"></div>
          <span>Demand (required hours)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border"></div>
          <span>Positive gap (surplus capacity)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border"></div>
          <span>Negative gap (capacity shortage)</span>
        </div>
      </div>
    </div>
  );
};
