
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { AbstractFilterStrategy } from './baseFilterStrategy';
import { format, startOfMonth, endOfMonth, isSameMonth, differenceInDays, addDays } from 'date-fns';

/**
 * Enhanced Time Horizon Filter Strategy
 * 
 * Handles filtering of demand matrix data by time range with improved edge case handling.
 * Prevents filtering out all data with single-day ranges and provides better validation.
 */
export class TimeHorizonFilterStrategy extends AbstractFilterStrategy {
  constructor() {
    super('time-horizon-filter', 3); // Applied after skill and client filters
  }

  shouldApply(filters: DemandFilters): boolean {
    return !!(filters.timeHorizon && filters.timeHorizon.start && filters.timeHorizon.end);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    if (!this.shouldApply(filters)) {
      console.log(`🎯 [TIME FILTER] No time horizon filter needed, returning original data`);
      return data;
    }

    const { start, end } = filters.timeHorizon!;
    console.log(`🎯 [TIME FILTER] Applying time horizon filter: ${start.toISOString()} to ${end.toISOString()}`);

    // Enhanced range validation and expansion
    const { expandedStart, expandedEnd } = this.validateAndExpandRange(start, end);
    
    console.log(`🔧 [TIME FILTER] Using expanded range: ${expandedStart.toISOString()} to ${expandedEnd.toISOString()}`);

    // Filter data points by time horizon using enhanced month-based comparison
    const filteredDataPoints = data.dataPoints.filter(point => {
      try {
        // Parse the month string (format: "YYYY-MM")
        const pointDate = new Date(point.month + '-01');
        
        if (isNaN(pointDate.getTime())) {
          console.warn(`⚠️ [TIME FILTER] Invalid date format for point: ${point.month}`);
          return true; // Keep point if date is invalid
        }

        // Use enhanced month-based comparison with expanded range
        const pointInRange = this.isPointInRange(pointDate, expandedStart, expandedEnd);

        if (!pointInRange) {
          console.log(`🔍 [TIME FILTER] Filtering out point for ${point.month} (outside expanded range)`);
        }

        return pointInRange;
      } catch (error) {
        console.warn(`⚠️ [TIME FILTER] Error processing point ${point.month}:`, error);
        return true; // Keep point if there's an error
      }
    });

    // Enhanced safeguard: If filtering would remove all data, return original data
    if (filteredDataPoints.length === 0) {
      console.warn(`⚠️ [TIME FILTER] Time filtering would remove all data points, returning original data`);
      console.log(`🔍 [TIME FILTER] Diagnostic:`, {
        originalDataPoints: data.dataPoints.length,
        originalMonths: data.dataPoints.map(p => p.month).slice(0, 5),
        filterRange: `${expandedStart.toISOString().split('T')[0]} to ${expandedEnd.toISOString().split('T')[0]}`,
        samplePointDates: data.dataPoints.slice(0, 3).map(p => ({
          month: p.month,
          parsedDate: new Date(p.month + '-01').toISOString().split('T')[0]
        }))
      });
      return data;
    }

    const result = this.recalculateTotals(data, filteredDataPoints);

    console.log(`✅ [TIME FILTER] Successfully filtered from ${data.dataPoints.length} to ${result.dataPoints.length} data points`);
    console.log(`📊 [TIME FILTER] Remaining months:`, result.dataPoints.map(p => p.month).slice(0, 10));

    return result;
  }

  /**
   * Validate and expand the time range to prevent problematic filtering
   */
  private validateAndExpandRange(start: Date, end: Date): { expandedStart: Date; expandedEnd: Date } {
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = differenceInDays(end, start);
    
    console.log(`🔧 [TIME FILTER] Range validation:`, {
      originalStart: start.toISOString(),
      originalEnd: end.toISOString(),
      timeDiffMs: timeDiff,
      daysDiff: daysDiff
    });

    // Handle problematic ranges
    if (daysDiff < 0) {
      console.warn(`⚠️ [TIME FILTER] Invalid range: end before start, swapping dates`);
      return this.validateAndExpandRange(end, start); // Swap and retry
    }

    if (daysDiff === 0) {
      console.warn(`⚠️ [TIME FILTER] Single-day range detected, expanding to monthly boundaries`);
      return {
        expandedStart: startOfMonth(start),
        expandedEnd: endOfMonth(start)
      };
    }

    if (daysDiff < 7) {
      console.warn(`⚠️ [TIME FILTER] Very short range (${daysDiff} days), expanding to ensure data coverage`);
      return {
        expandedStart: startOfMonth(start),
        expandedEnd: endOfMonth(addDays(start, 30)) // Expand to at least a month
      };
    }

    // For normal ranges, expand to monthly boundaries for better data matching
    return {
      expandedStart: startOfMonth(start),
      expandedEnd: endOfMonth(end)
    };
  }

  /**
   * Enhanced point-in-range check with multiple strategies
   */
  private isPointInRange(pointDate: Date, expandedStart: Date, expandedEnd: Date): boolean {
    // Strategy 1: Direct range check
    const directMatch = pointDate >= expandedStart && pointDate <= expandedEnd;
    
    // Strategy 2: Month-based comparison for edge cases
    const monthMatch = (
      isSameMonth(pointDate, expandedStart) ||
      isSameMonth(pointDate, expandedEnd) ||
      (pointDate > expandedStart && pointDate < expandedEnd)
    );

    // Strategy 3: Boundary month inclusion
    const boundaryMatch = (
      pointDate >= startOfMonth(expandedStart) && 
      pointDate <= endOfMonth(expandedEnd)
    );

    const result = directMatch || monthMatch || boundaryMatch;

    if (!result) {
      console.log(`🔍 [TIME FILTER] Point ${format(pointDate, 'yyyy-MM')} not in range:`, {
        pointDate: pointDate.toISOString(),
        expandedStart: expandedStart.toISOString(),
        expandedEnd: expandedEnd.toISOString(),
        directMatch,
        monthMatch,
        boundaryMatch
      });
    }

    return result;
  }
}
