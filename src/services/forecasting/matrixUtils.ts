
import { ForecastData, SkillHours } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { format, addMonths } from 'date-fns';

export interface MatrixDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercent: number;
}

export interface MatrixData {
  months: Array<{ key: string; label: string }>;
  skills: SkillType[];
  dataPoints: MatrixDataPoint[];
  totalDemand: number;
  totalCapacity: number;
  totalGap: number;
}

/**
 * Transform forecast data into matrix format for 12-month display
 */
export const transformForecastDataToMatrix = (forecastData: ForecastData[]): MatrixData => {
  const months: Array<{ key: string; label: string }> = [];
  const skillsSet = new Set<SkillType>();
  const dataPoints: MatrixDataPoint[] = [];
  
  let totalDemand = 0;
  let totalCapacity = 0;

  // Process each period of forecast data
  forecastData.forEach(periodData => {
    // Extract month key and label from period
    const monthKey = periodData.period;
    const monthLabel = formatPeriodToMonth(periodData.period);
    
    // Add month if not already present
    if (!months.find(m => m.key === monthKey)) {
      months.push({ key: monthKey, label: monthLabel });
    }

    // Create skill hours maps for this period
    const demandMap = new Map<SkillType, number>();
    const capacityMap = new Map<SkillType, number>();

    // Process demand data
    periodData.demand.forEach(skillHours => {
      demandMap.set(skillHours.skill, skillHours.hours);
      skillsSet.add(skillHours.skill);
      totalDemand += skillHours.hours;
    });

    // Process capacity data
    periodData.capacity.forEach(skillHours => {
      capacityMap.set(skillHours.skill, skillHours.hours);
      skillsSet.add(skillHours.skill);
      totalCapacity += skillHours.hours;
    });

    // Create data points for each skill in this period
    skillsSet.forEach(skill => {
      const demandHours = demandMap.get(skill) || 0;
      const capacityHours = capacityMap.get(skill) || 0;
      const gap = capacityHours - demandHours;
      const utilizationPercent = capacityHours > 0 ? (demandHours / capacityHours) * 100 : 0;

      dataPoints.push({
        skillType: skill,
        month: monthKey,
        monthLabel,
        demandHours,
        capacityHours,
        gap,
        utilizationPercent
      });
    });
  });

  // Sort months chronologically
  months.sort((a, b) => a.key.localeCompare(b.key));

  return {
    months,
    skills: Array.from(skillsSet).sort(),
    dataPoints,
    totalDemand,
    totalCapacity,
    totalGap: totalCapacity - totalDemand
  };
};

/**
 * Generate 12 months starting from a given date
 */
export const generate12MonthPeriods = (startDate: Date = new Date()): Array<{ key: string; label: string }> => {
  const months = [];
  
  for (let i = 0; i < 12; i++) {
    const month = addMonths(startDate, i);
    months.push({
      key: format(month, 'yyyy-MM'),
      label: format(month, 'MMM yyyy')
    });
  }
  
  return months;
};

/**
 * Convert period string to readable month format
 */
export const formatPeriodToMonth = (period: string): string => {
  try {
    // Handle different period formats
    if (period.includes('-')) {
      // Format: "2025-06"
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, 'MMM yyyy');
    }
    
    // If it's already formatted, return as is
    return period;
  } catch (error) {
    console.warn('Error formatting period:', period, error);
    return period;
  }
};

/**
 * Get matrix data point for specific skill and month
 */
export const getMatrixDataPoint = (
  matrixData: MatrixData,
  skillType: SkillType,
  monthKey: string
): MatrixDataPoint | null => {
  return matrixData.dataPoints.find(
    point => point.skillType === skillType && point.month === monthKey
  ) || null;
};

/**
 * Aggregate matrix data by skill across all months
 */
export const aggregateBySkill = (matrixData: MatrixData): Record<SkillType, {
  totalDemand: number;
  totalCapacity: number;
  totalGap: number;
  avgUtilization: number;
  monthCount: number;
}> => {
  const aggregated: Record<string, any> = {};

  matrixData.dataPoints.forEach(point => {
    if (!aggregated[point.skillType]) {
      aggregated[point.skillType] = {
        totalDemand: 0,
        totalCapacity: 0,
        totalGap: 0,
        avgUtilization: 0,
        monthCount: 0
      };
    }

    const agg = aggregated[point.skillType];
    agg.totalDemand += point.demandHours;
    agg.totalCapacity += point.capacityHours;
    agg.totalGap += point.gap;
    agg.avgUtilization += point.utilizationPercent;
    agg.monthCount += 1;
  });

  // Calculate averages
  Object.keys(aggregated).forEach(skill => {
    const agg = aggregated[skill];
    agg.avgUtilization = agg.monthCount > 0 ? agg.avgUtilization / agg.monthCount : 0;
  });

  return aggregated as Record<SkillType, any>;
};

/**
 * Handle missing data scenarios by filling with zeros
 */
export const fillMissingMatrixData = (
  matrixData: MatrixData,
  expectedSkills: SkillType[],
  expectedMonths: Array<{ key: string; label: string }>
): MatrixData => {
  const filledDataPoints = [...matrixData.dataPoints];

  // Ensure all skill-month combinations exist
  expectedSkills.forEach(skill => {
    expectedMonths.forEach(month => {
      const existing = filledDataPoints.find(
        point => point.skillType === skill && point.month === month.key
      );

      if (!existing) {
        filledDataPoints.push({
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

  return {
    ...matrixData,
    months: expectedMonths,
    skills: expectedSkills,
    dataPoints: filledDataPoints
  };
};
