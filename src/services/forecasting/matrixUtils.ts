
import { ForecastData, SkillHours } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { format, addMonths, startOfMonth } from 'date-fns';

export interface MatrixDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercent: number;
}

export interface MonthInfo {
  key: string;
  label: string;
}

export interface MatrixData {
  skills: SkillType[];
  months: MonthInfo[];
  dataPoints: MatrixDataPoint[];
  totalDemand: number;
  totalCapacity: number;
  totalGap: number;
}

/**
 * Transform forecast data into matrix format
 */
export const transformForecastDataToMatrix = (forecastData: ForecastData[]): MatrixData => {
  const skillsSet = new Set<SkillType>();
  const monthsMap = new Map<string, MonthInfo>();
  const dataPoints: MatrixDataPoint[] = [];

  // Process forecast data to extract skills and months
  forecastData.forEach(period => {
    // Add month info
    const monthLabel = format(new Date(period.period + '-01'), 'MMM yyyy');
    monthsMap.set(period.period, { key: period.period, label: monthLabel });

    // Collect all skills from demand and capacity
    const allSkillHours = [
      ...(period.demand || []),
      ...(period.capacity || [])
    ];

    allSkillHours.forEach(skillHour => {
      skillsSet.add(skillHour.skill);
    });
  });

  const skills = Array.from(skillsSet).sort();
  const months = Array.from(monthsMap.values()).sort((a, b) => a.key.localeCompare(b.key));

  // Create data points for each skill-month combination
  skills.forEach(skill => {
    months.forEach(month => {
      const period = forecastData.find(p => p.period === month.key);
      
      const demandHour = period?.demand?.find(d => d.skill === skill);
      const capacityHour = period?.capacity?.find(c => c.skill === skill);
      
      const demandHours = demandHour?.hours || 0;
      const capacityHours = capacityHour?.hours || 0;
      const gap = demandHours - capacityHours;
      const utilizationPercent = capacityHours > 0 ? (demandHours / capacityHours) * 100 : 0;

      dataPoints.push({
        skillType: skill,
        month: month.key,
        monthLabel: month.label,
        demandHours,
        capacityHours,
        gap,
        utilizationPercent
      });
    });
  });

  // Calculate totals
  const totalDemand = dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
  const totalCapacity = dataPoints.reduce((sum, point) => sum + point.capacityHours, 0);
  const totalGap = totalDemand - totalCapacity;

  return {
    skills,
    months,
    dataPoints,
    totalDemand,
    totalCapacity,
    totalGap
  };
};

/**
 * Fill missing data to ensure complete matrix - DATABASE SKILLS ONLY
 */
export const fillMissingMatrixData = (
  matrixData: MatrixData,
  databaseSkills: SkillType[], // Only use database skills
  expectedMonths: MonthInfo[]
): MatrixData => {
  // Use ONLY database skills - no additions or fallbacks
  const completeSkills = databaseSkills.sort();
  
  // Use expected months
  const completeMonths = expectedMonths;

  // Create complete data points grid
  const completeDataPoints: MatrixDataPoint[] = [];
  
  completeSkills.forEach(skill => {
    completeMonths.forEach(month => {
      // Find existing data point
      const existingPoint = matrixData.dataPoints.find(
        point => point.skillType === skill && point.month === month.key
      );

      if (existingPoint) {
        completeDataPoints.push(existingPoint);
      } else {
        // Create empty data point for missing combinations
        completeDataPoints.push({
          skillType: skill,
          month: month.key,
          monthLabel: month.label,
          demandHours: 0,
          capacityHours: 0,
          gap: 0,
          utilizationPercent: 0
        });
      }
    });
  });

  // Recalculate totals
  const totalDemand = completeDataPoints.reduce((sum, point) => sum + point.demandHours, 0);
  const totalCapacity = completeDataPoints.reduce((sum, point) => sum + point.capacityHours, 0);
  const totalGap = totalDemand - totalCapacity;

  return {
    skills: completeSkills,
    months: completeMonths,
    dataPoints: completeDataPoints,
    totalDemand,
    totalCapacity,
    totalGap
  };
};

/**
 * Generate 12 month periods starting from a given date
 */
export const generate12MonthPeriods = (startDate: Date): MonthInfo[] => {
  const months: MonthInfo[] = [];
  
  for (let i = 0; i < 12; i++) {
    const monthDate = addMonths(startOfMonth(startDate), i);
    const key = format(monthDate, 'yyyy-MM');
    const label = format(monthDate, 'MMM yyyy');
    
    months.push({ key, label });
  }
  
  return months;
};
