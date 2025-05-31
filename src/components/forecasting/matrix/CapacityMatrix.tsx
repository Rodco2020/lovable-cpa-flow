
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MatrixCell } from './MatrixCell';
import { MatrixLegend } from './MatrixLegend';

interface CapacityMatrixProps {
  className?: string;
}

/**
 * Main matrix component with 12-month grid
 * Displays demand vs capacity for each skill across 12 months
 */
export const CapacityMatrix: React.FC<CapacityMatrixProps> = ({ className }) => {
  // Generate 12 months starting from June 2025
  const generateMonths = () => {
    const months = [];
    const startDate = new Date(2025, 5, 1); // June 2025 (month is 0-indexed)
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      months.push({
        key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
        label: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      });
    }
    
    return months;
  };

  const months = generateMonths();
  
  // Skills from the existing forecasting system
  const skills = [
    'Junior',
    'Senior', 
    'CPA',
    'Tax Specialist',
    'Audit',
    'Advisory',
    'Bookkeeping'
  ];

  // Placeholder data - will be replaced with real data in later phases
  const getPlaceholderData = (skill: string, monthKey: string) => {
    // Generate consistent but varied placeholder data
    const baseValue = skills.indexOf(skill) * 10 + 40;
    const monthOffset = parseInt(monthKey.split('-')[1]) * 5;
    const demandHours = baseValue + monthOffset + Math.floor(Math.random() * 20);
    const capacityHours = baseValue + monthOffset + Math.floor(Math.random() * 30) + 10;
    
    return { demandHours, capacityHours };
  };

  return (
    <div className={className}>
      <MatrixLegend />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">12-Month Capacity Forecast Matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Demand vs Capacity by skill type across 12 months (hours)
          </p>
        </CardHeader>
        <CardContent>
          {/* Responsive grid container */}
          <div className="overflow-x-auto">
            <div 
              className="grid gap-1 min-w-[800px]"
              style={{
                gridTemplateColumns: `120px repeat(${months.length}, 1fr)`,
                gridTemplateRows: `auto repeat(${skills.length}, auto)`
              }}
            >
              {/* Top-left corner cell */}
              <div className="p-2 bg-gray-50 border font-medium text-sm flex items-center">
                Skill / Month
              </div>
              
              {/* Month headers */}
              {months.map((month) => (
                <div 
                  key={month.key}
                  className="p-2 bg-gray-50 border font-medium text-center text-sm"
                >
                  {month.label}
                </div>
              ))}
              
              {/* Skill rows */}
              {skills.map((skill) => (
                <React.Fragment key={skill}>
                  {/* Skill label */}
                  <div className="p-2 bg-gray-50 border font-medium text-sm flex items-center">
                    {skill}
                  </div>
                  
                  {/* Cells for each month */}
                  {months.map((month) => {
                    const { demandHours, capacityHours } = getPlaceholderData(skill, month.key);
                    return (
                      <MatrixCell
                        key={`${skill}-${month.key}`}
                        skillType={skill}
                        month={month.label}
                        demandHours={demandHours}
                        capacityHours={capacityHours}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Summary footer */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <strong>Matrix View:</strong> Each cell shows demand/capacity hours and utilization percentage. 
            Color coding indicates utilization levels from low (green) to over-capacity (red).
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CapacityMatrix;
