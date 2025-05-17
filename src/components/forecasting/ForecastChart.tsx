
import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SkillData } from '@/types/forecasting';

interface ForecastChartProps {
  data: any[];
  chartType: 'bar' | 'line';
  showDemand: boolean;
  showCapacity: boolean;
  skills: SkillData[] | 'all';
}

const ForecastChart: React.FC<ForecastChartProps> = ({ 
  data, 
  chartType, 
  showDemand, 
  showCapacity,
  skills
}) => {
  // Transform data for the chart
  const chartData = data.map(period => {
    const result: any = { period: period.period };
    
    // Add demand data if needed
    if (showDemand && period.demand) {
      period.demand.forEach((skillHours: any) => {
        // Check if skill is included in the filter
        if (skills === 'all' || skills.some(s => s.id === skillHours.skill)) {
          result[`demand_${skillHours.skill}`] = skillHours.hours;
        }
      });
    }
    
    // Add capacity data if needed
    if (showCapacity && period.capacity) {
      period.capacity.forEach((skillHours: any) => {
        // Check if skill is included in the filter
        if (skills === 'all' || skills.some(s => s.id === skillHours.skill)) {
          result[`capacity_${skillHours.skill}`] = skillHours.hours;
        }
      });
    }
    
    return result;
  });
  
  // Generate colors for each skill
  const skillColors: Record<string, string> = {
    'Junior': '#9b87f5', // Primary Purple
    'Senior': '#7E69AB', // Secondary Purple
    'CPA': '#6E59A5', // Tertiary Purple
    'Tax Specialist': '#D946EF', // Magenta Pink
    'Audit': '#0EA5E9', // Ocean Blue
    'Advisory': '#F97316', // Bright Orange
    'Bookkeeping': '#33C3F0', // Sky Blue
    'Tax': '#4CAF50', // Green
  };
  
  // Flatten skill hours for legend
  const uniqueSkills = new Set<string>();
  data.forEach(period => {
    if (period.demand) {
      period.demand.forEach((skillHours: any) => uniqueSkills.add(skillHours.skill));
    }
    if (period.capacity) {
      period.capacity.forEach((skillHours: any) => uniqueSkills.add(skillHours.skill));
    }
  });
  
  // Filter skills based on the skills prop
  const filteredSkills = skills === 'all' 
    ? Array.from(uniqueSkills)
    : Array.from(uniqueSkills).filter(skill => skills.some(s => s.id === skill));
  
  // Format tooltip and legend labels
  const formatName = (name: string | number) => {
    const nameStr = String(name);
    if (nameStr.startsWith('demand_')) {
      return `Demand: ${nameStr.replace('demand_', '')}`;
    }
    return `Capacity: ${nameStr.replace('capacity_', '')}`;
  };
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value, name) => {
              return [`${value} hours`, formatName(name)];
            }} />
            <Legend formatter={(value) => formatName(value)} />
            
            {/* Render bars for demand */}
            {showDemand && filteredSkills.map(skill => (
              <Bar 
                key={`demand_${skill}`}
                dataKey={`demand_${skill}`} 
                name={`demand_${skill}`}
                stackId="demand"
                fill={skillColors[skill] || '#8884d8'}
              />
            ))}
            
            {/* Render bars for capacity */}
            {showCapacity && filteredSkills.map(skill => (
              <Bar 
                key={`capacity_${skill}`}
                dataKey={`capacity_${skill}`} 
                name={`capacity_${skill}`}
                stackId="capacity"
                fill={skillColors[skill] ? `${skillColors[skill]}80` : '#82ca9d'}
              />
            ))}
          </BarChart>
        ) : (
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value, name) => {
              return [`${value} hours`, formatName(name)];
            }} />
            <Legend formatter={(value) => formatName(value)} />
            
            {/* Render lines for demand */}
            {showDemand && filteredSkills.map(skill => (
              <Line 
                key={`demand_${skill}`}
                type="monotone" 
                dataKey={`demand_${skill}`} 
                name={`demand_${skill}`}
                stroke={skillColors[skill] || '#8884d8'}
                activeDot={{ r: 8 }}
              />
            ))}
            
            {/* Render lines for capacity */}
            {showCapacity && filteredSkills.map(skill => (
              <Line 
                key={`capacity_${skill}`}
                type="monotone" 
                dataKey={`capacity_${skill}`} 
                name={`capacity_${skill}`}
                stroke={skillColors[skill] ? `${skillColors[skill]}80` : '#82ca9d'}
                strokeDasharray="3 3"
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
