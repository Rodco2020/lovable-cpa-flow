
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { AbstractFilterStrategy } from './baseFilterStrategy';
import { format, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

/**
 * Time Horizon Filter Strategy
 * 
 * Handles filtering of demand matrix data by time range.
 * Filters data points that fall outside the specified time horizon.
 * Enhanced to prevent filtering out all data with single-day ranges.
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
      return data; // No filtering needed
    }

    const { start, end } = filters.timeHorizon!;
    console.log(`🎯 [TIME FILTER] Applying time horizon filter: ${start.toISOString()} to ${end.toISOString()}`);

    // Check if this is a problematic single-day range
    const timeDiff = end.getTime() - start.getTime();
    const isVeryShortRange = timeDiff < 24 * 60 * 60 * 1000; // Less than 24 hours

    if (isVeryShortRange) {
      console.warn(`⚠️ [TIME FILTER] Detected very short time range (${timeDiff}ms), expanding to monthly boundaries`);
      
      // Expand to monthly boundaries to prevent filtering out all data
      const expandedStart = startOfMonth(start);
      const expandedEnd = endOfMonth(end);
      
      console.log(`🔧 [TIME FILTER] Expanded range: ${expandedStart.toISOString()} to ${expandedEnd.toISOString()}`);
      
      return this.filterByExpandedRange(data, expandedStart, expandedEnd);
    }

    // Filter data points by time horizon using month-based comparison
    const filteredDataPoints = data.dataPoints.filter(point => {
      try {
        // Parse the month string (format: "YYYY-MM")
        const pointDate = new Date(point.month + '-01');
        
        if (isNaN(pointDate.getTime())) {
          console.warn(`⚠️ [TIME FILTER] Invalid date format for point: ${point.month}`);
          return true; // Keep point if date is invalid
        }

        // Use month-based comparison for more reliable filtering
        const pointInRange = (
          (pointDate >= startOfMonth(start) && pointDate <= endOfMonth(end)) ||
          isSameMonth(pointDate, start) ||
          isSameMonth(pointDate, end)
        );

        if (!pointInRange) {
          console.log(`🔍 [TIME FILTER] Filtering out point for ${point.month} (outside range)`);
        }

        return pointInRange;
      } catch (error) {
        console.warn(`⚠️ [TIME FILTER] Error processing point ${point.month}:`, error);
        return true; // Keep point if there's an error
      }
    });

    // Safeguard: If filtering would remove all data, return original data
    if (filteredDataPoints.length === 0) {
      console.warn(`⚠️ [TIME FILTER] Time filtering would remove all data points, returning original data`);
      console.log(`🔍 [TIME FILTER] Original data had ${data.dataPoints.length} points covering months:`, 
        data.dataPoints.map(p => p.month).slice(0, 5));
      return data;
    }

    const result = this.recalculateTotals(data, filteredDataPoints);

    console.log(`✅ [TIME FILTER] Successfully filtered from ${data.dataPoints.length} to ${result.dataPoints.length} data points`);
    console.log(`📊 [TIME FILTER] Remaining months:`, result.dataPoints.map(p => p.month).slice(0, 10));

    return result;
  }

  /**
   * Filter by expanded range with additional validation
   */
  private filterByExpandedRange(data: DemandMatrixData, expandedStart: Date, expandedEnd: Date): DemandMatrixData {
    const filteredDataPoints = data.dataPoints.filter(point => {
      try {
        const pointDate = new Date(point.month + '-01');
        return pointDate >= expandedStart && pointDate <= expandedEnd;
      } catch (error) {
        console.warn(`⚠️ [TIME FILTER] Error in expanded range filtering:`, error);
        return true;
      }
    });

    return this.recalculateTotals(data, filteredDataPoints);
  }
}
