import { supabase } from '@/lib/supabase';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { AvailabilityService } from '@/services/availability/availabilityService';
import { PeriodProcessingService } from '../demand/matrixTransformer/periodProcessingService';
import { MonthlyDemandCalculationService } from '../demand/matrixTransformer/monthlyDemandCalculationService';
import { staffQueries } from '@/utils/staffQueries';
import { DetailTaskRevenueCalculator } from '../demand/calculators/detailTaskRevenueCalculator';
import { ClientRevenueCalculator } from '../demand/matrixTransformer/clientRevenueCalculator';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';
import { ClientDataValidator } from '@/services/forecasting/validation/clientDataValidator';
import type { Task } from '../demand/calculators/detailTaskRevenueCalculator';

/**
 * Staff Forecast Summary Service
 * 
 * Handles calculation of staff utilization data for forecast summary views
 * FIXED: Now uses centralized staff queries to avoid schema mismatch
 */
export class StaffForecastSummaryService {
  private static availabilityService = new AvailabilityService();

  /**
   * Calculate staff utilization across forecast periods
   */
  static async calculateStaffUtilization(
    forecastPeriods: ForecastData[],
    recurringTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData[]> {
    console.log('🚀 [STAFF FORECAST SUMMARY] Starting staff utilization calculation:', {
      periodsCount: forecastPeriods.length,
      tasksCount: recurringTasks.length,
      monthsCount: months.length
    });

    try {
      // FIXED: Use centralized staff query utility instead of direct Supabase call
      const staffMembers = await staffQueries.getActiveStaff();

      if (!staffMembers || staffMembers.length === 0) {
        console.warn('No active staff members found');
        return [];
      }

      console.log(`📊 [STAFF FORECAST SUMMARY] Processing ${staffMembers.length} staff members`);

      // Calculate utilization for each staff member
      const utilizationPromises = staffMembers.map(staff => 
        this.calculateStaffMemberUtilization(staff, recurringTasks, months)
      );

      const staffUtilization = await Promise.all(utilizationPromises);

      // Handle unassigned tasks
      const unassignedUtilization = await this.calculateUnassignedTasksUtilization(recurringTasks, months);
      
      const allUtilization = [...staffUtilization, unassignedUtilization].filter(Boolean);

      console.log('✅ [STAFF FORECAST SUMMARY] Staff utilization calculation complete:', {
        totalStaff: allUtilization.length,
        assignedStaff: staffUtilization.filter(Boolean).length,
        hasUnassigned: !!unassignedUtilization
      });

      return allUtilization;

    } catch (error) {
      console.error('❌ [STAFF FORECAST SUMMARY] Error calculating staff utilization:', error);
      throw error;
    }
  }

  /**
   * Calculate utilization for a single staff member
   */
  private static async calculateStaffMemberUtilization(
    staff: any,
    recurringTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData | null> {
    try {
      // Get tasks assigned to this staff member
      const assignedTasks = recurringTasks.filter(task => 
        task.preferred_staff_id === staff.id
      );

      if (assignedTasks.length === 0) {
        console.log(`📝 [STAFF FORECAST SUMMARY] No tasks assigned to ${staff.full_name}`);
        return null;
      }

      console.log(`📝 [STAFF FORECAST SUMMARY] Processing ${assignedTasks.length} tasks for ${staff.full_name}`);

      // Calculate monthly data
      const monthlyData: Record<string, any> = {};
      let totalHours = 0;
      let totalCapacityHours = 0;

      for (const month of months) {
        const monthlyCapacity = await this.getStaffCapacityForMonth(staff.id, month);
        const monthlyDemand = this.calculateMonthlyDemand(assignedTasks, month);

        console.log(`Staff capacity calculated for ${staff.full_name}:`, {
          staffId: staff.id,
          month: month.key,
          monthlyCapacity,
          monthlyDemand,
          hasValidDates: !!(month.startDate && month.endDate)
        });

        monthlyData[month.key] = {
          demandHours: monthlyDemand,
          capacityHours: monthlyCapacity,
          gap: monthlyCapacity - monthlyDemand,
          utilizationPercentage: monthlyCapacity > 0 ? (monthlyDemand / monthlyCapacity) * 100 : 0
        };

        totalHours += monthlyDemand;
        totalCapacityHours += monthlyCapacity;
      }

      const overallUtilization = totalCapacityHours > 0 ? (totalHours / totalCapacityHours) * 100 : 0;

      // FIXED: Calculate revenue metrics using correct methodology per user requirements
      let totalExpectedRevenue = 0;  // Client apportionment methodology 
      let totalSuggestedRevenue = 0; // Skill fee rates calculation
      let expectedHourlyRate = 0;
      
      try {
        console.log(`💰 [REVENUE CALC] Starting revenue calculation for ${staff.full_name} with ${totalHours}h from ${assignedTasks.length} tasks`);
        
        // Get skill fee rates for suggested revenue calculation
        const skillFeeRatesMap = await getSkillFeeRatesMap();
        
        // Calculate suggested revenue using skill fee rates (totalHours × skill_fee_rate)
        const primarySkill = assignedTasks[0]?.required_skills?.[0];
        if (primarySkill && skillFeeRatesMap.has(primarySkill)) {
          const skillFeeRate = skillFeeRatesMap.get(primarySkill) || 0;
          totalSuggestedRevenue = totalHours * skillFeeRate;
          expectedHourlyRate = skillFeeRate;
          console.log(`💰 [REVENUE CALC] Using skill fee rate for ${primarySkill}: $${skillFeeRate}/hr`);
        } else {
          // Fallback to staff cost_per_hour if no skill fee rate found
          expectedHourlyRate = staff.cost_per_hour || 0;
          totalSuggestedRevenue = totalHours * expectedHourlyRate;
        console.log(`💰 [REVENUE CALC] Using staff cost_per_hour: $${expectedHourlyRate}/hr (skill ${primarySkill} not found)`);
        }

        // DIAGNOSTIC LOG #1: Check what data we have before fetching clients
        console.log(`🔍 [DIAGNOSTIC] Before fetching clients for ${staff.full_name}:`, {
          staffName: staff.full_name,
          totalHours,
          assignedTasksCount: assignedTasks.length,
          primarySkill,
          totalSuggestedRevenue
        });

        // ENHANCED: Use client validator for robust client data handling
        console.log(`🔍 [DIAGNOSTIC] Using enhanced client validation for ${staff.full_name}...`);
        
        const taskClientIds = assignedTasks.map(task => task.client_id);
        const taskClientNames = assignedTasks.map(task => task.clients?.legal_name || 'Unknown Client');
        
        const { clientRevenueMap, validationReport } = await ClientDataValidator.validateAndEnrichClientData(
          taskClientIds,
          taskClientNames
        );
        
        console.log(`🔍 [DIAGNOSTIC] Client validation report for ${staff.full_name}:`, validationReport);
        
        // Convert clientRevenueMap to array format for compatibility
        const clientsWithExpectedRevenue = {
          data: Array.from(clientRevenueMap.values()),
          error: validationReport.dataQualityIssues.length > 0 ? 
            new Error(`Data quality issues: ${validationReport.dataQualityIssues.join('; ')}`) : null
        };
        
        if (clientsWithExpectedRevenue.error) {
          console.error(`❌ [REVENUE CALC] Database error fetching clients: ${clientsWithExpectedRevenue.error.message}`);
          throw new Error(`Failed to fetch client data: ${clientsWithExpectedRevenue.error.message}`);
        }

        if (clientsWithExpectedRevenue.data && clientsWithExpectedRevenue.data.length > 0) {
          console.log(`💰 [REVENUE CALC] Found ${clientsWithExpectedRevenue.data.length} active clients with revenue data`);
          
          // DIAGNOSTIC LOG #2: Check client data quality and identify potential issues
          const clientsWithPositiveRevenue = clientsWithExpectedRevenue.data.filter(c => c.expected_monthly_revenue > 0);
          const clientsWithZeroRevenue = clientsWithExpectedRevenue.data.filter(c => c.expected_monthly_revenue <= 0);
          
          console.log(`🔍 [DIAGNOSTIC] Client data quality for ${staff.full_name}:`, {
            totalClientsFound: clientsWithExpectedRevenue.data.length,
            clientsWithPositiveRevenue: clientsWithPositiveRevenue.length,
            clientsWithZeroRevenue: clientsWithZeroRevenue.length,
            averageRevenue: clientsWithPositiveRevenue.length > 0 ? 
              (clientsWithPositiveRevenue.reduce((sum, c) => sum + c.expected_monthly_revenue, 0) / clientsWithPositiveRevenue.length).toFixed(2) : 0,
            sampleClientsWithRevenue: clientsWithPositiveRevenue.slice(0, 3).map(c => ({
              name: c.legal_name,
              revenue: c.expected_monthly_revenue
            })),
            zeroRevenueClients: clientsWithZeroRevenue.slice(0, 3).map(c => c.legal_name)
          });
          
          // Get unique clients from assigned tasks for proper client revenue calculation
          const uniqueClientIds = [...new Set(assignedTasks.map(task => task.client_id))];
          const relevantClients = clientsWithExpectedRevenue.data.filter(client => 
            uniqueClientIds.includes(client.id)
          );
          
          console.log(`💰 [REVENUE CALC] Processing ${relevantClients.length} relevant clients from ${uniqueClientIds.length} unique client IDs`);

          // DIAGNOSTIC LOG #3: Check client matching for Ana Florian's tasks
          if (staff.full_name === 'Ana Florian') {
            console.log(`🔍 [DIAGNOSTIC ANA] Client matching for Ana Florian:`, {
              uniqueClientIds,
              relevantClients: relevantClients.map(c => ({
                id: c.id,
                name: c.legal_name,
                revenue: c.expected_monthly_revenue
              })),
              assignedTasksWithClients: assignedTasks.map(t => ({
                taskName: t.name,
                clientId: t.client_id,
                clientName: t.clients?.legal_name
              }))
            });
          }

          // Build detailed task data for revenue calculation with CORRECT monthly distribution
          const tasksForRevenue = assignedTasks.map(task => {
            // FIXED: Calculate total hours across ALL months using monthlyDistribution
            const totalTaskHours = months.reduce((sum, month) => {
              const monthlyHours = (task as any).monthlyDistribution?.[month.key] || 0;
              return sum + monthlyHours;
            }, 0);
            
            console.log(`💰 [TASK HOURS CALC] Task ${task.name}: ${totalTaskHours}h total across ${months.length} months`);
            
            return {
              id: task.id,
              taskName: task.name,
              clientName: task.clients?.legal_name || 'Unknown Client',
              clientId: task.client_id,
              skillRequired: task.required_skills?.[0] || 'General',
              monthlyHours: totalTaskHours / months.length, // Average for compatibility
              totalHours: totalTaskHours, // CORRECT: Use actual total across all months
              month: months[0]?.key || new Date().toISOString().slice(0, 7),
              monthLabel: months[0]?.label || 'Current Period',
              recurrencePattern: task.recurrence_type || 'Unknown',
              priority: task.priority,
              category: task.category
            };
          });

          console.log(`💰 [REVENUE CALC] Prepared ${tasksForRevenue.length} tasks for revenue calculation:`, 
            tasksForRevenue.map(t => `${t.taskName}: ${t.totalHours}h for ${t.clientName}`));

          // Build client revenue data using relevant clients only
          const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
            relevantClients,
            tasksForRevenue,
            months.length
          );

          // DIAGNOSTIC LOG #4: Check final client revenue data for Ana Florian
          if (staff.full_name === 'Ana Florian') {
            console.log(`🔍 [DIAGNOSTIC ANA] Client revenue data built for Ana Florian:`, {
              clientRevenueDataSize: clientRevenueData.size,
              clientRevenueEntries: Array.from(clientRevenueData.entries()).map(([name, data]) => ({
                clientName: name,
                totalHours: data.totalHours,
                expectedMonthlyRevenue: data.expectedMonthlyRevenue,
                totalExpectedRevenue: data.totalExpectedRevenue
              }))
            });
          }

          console.log(`💰 [REVENUE CALC] Built client revenue data for ${clientRevenueData.size} clients:`, 
            Array.from(clientRevenueData.entries()).map(([name, data]) => 
              `${name}: ${data.totalHours}h, $${data.totalExpectedRevenue}`));

          // Calculate revenue using client apportionment for expected revenue
          const tasksWithRevenue = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
            tasksForRevenue,
            clientRevenueData
          );

          console.log(`💰 [REVENUE CALC] Calculated revenue for ${tasksWithRevenue.size} tasks`);

          // Calculate expected revenue using client apportionment
          totalExpectedRevenue = Array.from(tasksWithRevenue.values()).reduce((sum, revenueResult) => {
            const expectedRevenue = revenueResult.totalExpectedRevenue || 0;
            console.log(`💰 [REVENUE CALC] Adding task expected revenue: $${expectedRevenue}`);
            return sum + expectedRevenue;
          }, 0);
          
          console.log(`💰 [REVENUE CALC] Final totalExpectedRevenue for ${staff.full_name}: $${totalExpectedRevenue}`);
        } else {
          console.warn(`💰 [REVENUE CALC] No active clients with expected revenue found`);
        }
      } catch (error) {
        console.error(`❌ [REVENUE CALC] Error calculating revenue for staff ${staff.full_name}:`, error);
        expectedHourlyRate = staff.cost_per_hour || 0;
        totalSuggestedRevenue = totalHours * expectedHourlyRate;
        totalExpectedRevenue = 0;
      }

      const expectedLessSuggested = totalExpectedRevenue - totalSuggestedRevenue;

      console.log(`💰 [STAFF MEMBER RESULT] Final result for ${staff.full_name}:`, {
        totalExpectedRevenue: `$${totalExpectedRevenue}`,
        totalSuggestedRevenue: `$${totalSuggestedRevenue}`,
        expectedLessSuggested: `$${expectedLessSuggested}`,
        expectedHourlyRate: `$${expectedHourlyRate}/hr`,
        totalHours: `${totalHours}h`
      });

      return {
        staffId: staff.id,
        staffName: staff.full_name,
        totalHours,
        totalCapacityHours,
        utilizationPercentage: overallUtilization,
        expectedHourlyRate: expectedHourlyRate || 0,
        totalExpectedRevenue: totalExpectedRevenue || 0, // Ensure never undefined
        totalSuggestedRevenue: totalSuggestedRevenue || 0,
        expectedLessSuggested: expectedLessSuggested || 0,
        monthlyData
      };

    } catch (error) {
      console.error(`Error calculating utilization for staff ${staff.full_name}:`, error);
      return null;
    }
  }

  /**
   * Get staff capacity for a specific month with fallback date generation
   * PHASE 2 FIX: Add fallback to generate dates from month key
   */
  private static async getStaffCapacityForMonth(
    staffId: string,
    month: MonthInfo
  ): Promise<number> {
    try {
      // Get weekly capacity
      const availability = await this.availabilityService.getAvailabilityForStaff(staffId);
      if (!availability || availability.length === 0) {
        return 0;
      }

      const weeklyCapacityHours = this.availabilityService.calculateWeeklyCapacity(availability);
      
      // Ensure we have valid dates, with fallback to period processing service
      let startDate = month.startDate;
      let endDate = month.endDate;
      
      if (!startDate || !endDate) {
        // Fallback: Generate dates from month key
        const dateRange = PeriodProcessingService.getPeriodDateRange(month.key);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
        
        console.warn(`Month ${month.key} missing dates, generated from key:`, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
      }
      
      // Convert to monthly with valid dates
      return this.availabilityService.convertWeeklyToMonthlyCapacity(
        weeklyCapacityHours,
        startDate,
        endDate
      );
    } catch (error) {
      console.error(`Error calculating capacity for staff ${staffId} in month ${month.key}:`, error);
      return 0;
    }
  }

  /**
   * Calculate monthly demand for assigned tasks using monthlyDistribution data
   * FIXED: Now uses monthlyDistribution which contains the correct monthly hours
   */
  private static calculateMonthlyDemand(
    tasks: RecurringTaskDB[],
    month: MonthInfo
  ): number {
    console.log(`🔍 [MONTHLY DEMAND] Calculating demand for month ${month.key} with ${tasks.length} tasks`);
    
    return tasks.reduce((total, task) => {
      try {
        // Use monthlyDistribution data for month-specific hours
        const monthKey = month.key; // Should be in format "YYYY-MM"
        const monthlyHours = (task as any).monthlyDistribution?.[monthKey] || 0;
        
        console.log(`📊 [MONTHLY DEMAND] Task ${task.id} (${task.name}) in ${month.key}:`, {
          monthlyHours,
          monthKey,
          hasDistribution: !!((task as any).monthlyDistribution),
          distributionKeys: Object.keys((task as any).monthlyDistribution || {})
        });
        
        return total + monthlyHours;
      } catch (error) {
        console.error(`❌ [MONTHLY DEMAND] Error calculating demand for task ${task.id}:`, error);
        return total;
      }
    }, 0);
  }

  /**
   * Calculate utilization for unassigned tasks
   * FIXED: Now uses same revenue calculation methodology as assigned tasks
   */
  private static async calculateUnassignedTasksUtilization(
    recurringTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData | null> {
    const unassignedTasks = recurringTasks.filter(task => !task.preferred_staff_id);

    if (unassignedTasks.length === 0) {
      return null;
    }

    const monthlyData: Record<string, any> = {};
    let totalHours = 0;

    for (const month of months) {
      const monthlyDemand = this.calculateMonthlyDemand(unassignedTasks, month);
      
      monthlyData[month.key] = {
        demandHours: monthlyDemand,
        capacityHours: 0,
        gap: -monthlyDemand,
        utilizationPercentage: 0
      };

      totalHours += monthlyDemand;
    }

    // FIXED: Calculate revenue using correct methodology per user requirements for unassigned tasks
    let totalExpectedRevenue = 0;  // Client apportionment methodology
    let totalSuggestedRevenue = 0; // Skill fee rates calculation
    let expectedHourlyRate = 0;
    
    try {
      console.log(`💰 [UNASSIGNED REVENUE] Starting revenue calculation for ${unassignedTasks.length} unassigned tasks with ${totalHours}h`);
      
      // Get skill fee rates for suggested revenue calculation
      const skillFeeRatesMap = await getSkillFeeRatesMap();
      
      // Calculate suggested revenue using skill fee rates for unassigned tasks
      if (totalHours > 0) {
        const primarySkill = unassignedTasks[0]?.required_skills?.[0];
        if (primarySkill && skillFeeRatesMap.has(primarySkill)) {
          const skillFeeRate = skillFeeRatesMap.get(primarySkill) || 0;
          totalSuggestedRevenue = totalHours * skillFeeRate;
          expectedHourlyRate = skillFeeRate;
          console.log(`💰 [UNASSIGNED REVENUE] Using skill fee rate for ${primarySkill}: $${skillFeeRate}/hr`);
        } else {
          // Fallback to default rate for unassigned tasks
          expectedHourlyRate = 100; // Default rate
          totalSuggestedRevenue = totalHours * expectedHourlyRate;
          console.log(`💰 [UNASSIGNED REVENUE] Using default rate: $${expectedHourlyRate}/hr (skill ${primarySkill} not found)`);
        }

        // ENHANCED: Use client validator for robust client data handling for unassigned tasks
        console.log(`🔍 [UNASSIGNED DIAGNOSTIC] Using enhanced client validation for unassigned tasks...`);
        
        const taskClientIds = unassignedTasks.map(task => task.client_id);
        const taskClientNames = unassignedTasks.map(task => task.clients?.legal_name || 'Unknown Client');
        
        const { clientRevenueMap, validationReport } = await ClientDataValidator.validateAndEnrichClientData(
          taskClientIds,
          taskClientNames
        );
        
        console.log(`🔍 [UNASSIGNED DIAGNOSTIC] Client validation report for unassigned tasks:`, validationReport);
        
        // Convert clientRevenueMap to array format for compatibility
        const clientsWithExpectedRevenue = {
          data: Array.from(clientRevenueMap.values()),
          error: validationReport.dataQualityIssues.length > 0 ? 
            new Error(`Data quality issues: ${validationReport.dataQualityIssues.join('; ')}`) : null
        };
        
        if (clientsWithExpectedRevenue.data && clientsWithExpectedRevenue.data.length > 0) {
          console.log(`💰 [UNASSIGNED REVENUE] Found ${clientsWithExpectedRevenue.data.length} active clients`);
          
          // Get unique clients from unassigned tasks for proper client revenue calculation
          const uniqueClientIds = [...new Set(unassignedTasks.map(task => task.client_id))];
          const relevantClients = clientsWithExpectedRevenue.data.filter(client => 
            uniqueClientIds.includes(client.id)
          );
          
          console.log(`💰 [UNASSIGNED REVENUE] Processing ${relevantClients.length} relevant clients`);

          // Build detailed task data for revenue calculation with CORRECT monthly distribution
          const tasksForRevenue = unassignedTasks.map(task => {
            // FIXED: Calculate total hours across ALL months using monthlyDistribution
            const totalTaskHours = months.reduce((sum, month) => {
              const monthlyHours = (task as any).monthlyDistribution?.[month.key] || 0;
              return sum + monthlyHours;
            }, 0);
            
            console.log(`💰 [UNASSIGNED TASK HOURS] Task ${task.name}: ${totalTaskHours}h total across ${months.length} months`);
            
            return {
              id: task.id,
              taskName: task.name,
              clientName: task.clients?.legal_name || 'Unknown Client',
              clientId: task.client_id,
              skillRequired: task.required_skills?.[0] || 'General',
              monthlyHours: totalTaskHours / months.length, // Average for compatibility
              totalHours: totalTaskHours, // CORRECT: Use actual total across all months
              month: months[0]?.key || new Date().toISOString().slice(0, 7),
              monthLabel: months[0]?.label || 'Current Period',
              recurrencePattern: task.recurrence_type || 'Unknown',
              priority: task.priority,
              category: task.category
            };
          });

          // Build client revenue data using relevant clients only
          const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
            relevantClients,
            tasksForRevenue,
            months.length
          );

          console.log(`💰 [UNASSIGNED REVENUE] Built client revenue data for ${clientRevenueData.size} clients`);

          // Calculate revenue for unassigned tasks using client apportionment
          const tasksWithRevenue = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
            tasksForRevenue,
            clientRevenueData
          );

          // Calculate expected revenue using client apportionment
          totalExpectedRevenue = Array.from(tasksWithRevenue.values()).reduce((sum, revenueResult) => {
            const expectedRevenue = revenueResult.totalExpectedRevenue || 0;
            console.log(`💰 [UNASSIGNED REVENUE] Adding task expected revenue: $${expectedRevenue}`);
            return sum + expectedRevenue;
          }, 0);
          
          console.log(`💰 [UNASSIGNED REVENUE] Final totalExpectedRevenue for unassigned tasks: $${totalExpectedRevenue}`);
        } else {
          console.warn(`💰 [UNASSIGNED REVENUE] No active clients with expected revenue found`);
        }
      }
    } catch (error) {
      console.error('❌ [UNASSIGNED REVENUE] Error calculating revenue for unassigned tasks:', error);
      expectedHourlyRate = 100; // Default fallback
      totalSuggestedRevenue = totalHours * expectedHourlyRate;
      totalExpectedRevenue = 0;
    }

    return {
      staffId: 'unassigned',
      staffName: 'Unassigned Tasks',
      totalHours,
      totalCapacityHours: 0,
      utilizationPercentage: 0,
      expectedHourlyRate,
      totalExpectedRevenue,
      totalSuggestedRevenue,
      expectedLessSuggested: totalExpectedRevenue - totalSuggestedRevenue,
      monthlyData
    };
  }

  /**
   * Calculate firm-wide totals
   */
  static calculateFirmWideTotals(utilizationData: StaffUtilizationData[]) {
    console.log(`📊 [FIRM TOTALS] Calculating firm-wide totals for ${utilizationData.length} staff members`);
    
    const totalDemand = utilizationData.reduce((sum, staff) => sum + staff.totalHours, 0);
    const totalCapacity = utilizationData.reduce((sum, staff) => sum + staff.totalCapacityHours, 0);
    
    // Debug individual staff revenue contributions
    console.log(`📊 [FIRM TOTALS] Staff revenue breakdown:`);
    utilizationData.forEach(staff => {
      const staffRevenue = staff.totalExpectedRevenue || 0;
      console.log(`📊 [FIRM TOTALS] ${staff.staffName}: $${staffRevenue} (${staff.totalHours}h)`);
    });
    
    const totalRevenue = utilizationData.reduce((sum, staff) => {
      const staffRevenue = staff.totalExpectedRevenue || 0;
      return sum + staffRevenue;
    }, 0);
    
    const overallUtilization = totalCapacity > 0 ? (totalDemand / totalCapacity) * 100 : 0;
    const totalGap = totalCapacity - totalDemand;

    console.log(`📊 [FIRM TOTALS] Final totals:`, {
      totalDemand: `${totalDemand}h`,
      totalCapacity: `${totalCapacity}h`,
      totalRevenue: `$${totalRevenue}`,
      overallUtilization: `${overallUtilization.toFixed(1)}%`,
      totalGap: `${totalGap}h`
    });

    return {
      totalDemand,
      totalCapacity,
      overallUtilization,
      totalRevenue,
      totalGap
    };
  }
}
