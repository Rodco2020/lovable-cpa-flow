
import React from 'react';

interface WeeklyAvailabilityMatrixProps {
  staffId: string;
  onAvailabilityChange?: (availability: any) => void;
}

export const WeeklyAvailabilityMatrix: React.FC<WeeklyAvailabilityMatrixProps> = ({
  staffId,
  onAvailabilityChange
}) => {
  // FIXED: Remove the second parameter that was causing the error
  const handleChange = (value: any) => {
    if (onAvailabilityChange) {
      onAvailabilityChange(value);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Weekly Availability Matrix</h3>
      <p>Staff ID: {staffId}</p>
      <div className="grid grid-cols-7 gap-2 mt-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
          <div key={day} className="text-center">
            <div className="font-medium mb-2">{day}</div>
            <div className="h-20 bg-gray-100 rounded p-2">
              <button
                onClick={() => handleChange({ day: index, available: true })}
                className="w-full h-full bg-green-200 hover:bg-green-300 rounded text-xs"
              >
                Available
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyAvailabilityMatrix;
