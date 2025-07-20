
import { EnhancedAvailabilityService, WeeklyCapacitySummary } from '@/services/availability/enhancedAvailabilityService';
import { getAllStaff } from '@/services/staffService';
import { normalizeSkills } from '@/services/skillNormalizationService';
import { ForecastData, SkillHours } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { addMonths, format, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Availability-Based Capacity Service
 * Integrates staff availability matrix with capacity forecasting
 */
export class AvailabilityBasedCapacityService {
  private availabilityService: EnhancedAvailabilityService;

  constructor() {
    this.availabilityService = new EnhancedAvailabilityService();
  }

  /**
   * Generate capacity forecast based on staff availability matrices
   */
  async generateAvailabilityBasedCapacityForecast(
    startDate: Date, 
    endDate: Date
  ): Promise<ForecastData[]> {
    console.log('🚀 [AVAILABILITY CAPACITY] Generating availability-based capacity forecast');
    
    try {
      // Get all active staff
      const staff = await getAllStaff();
      const activeStaff = staff.filter(s => s.status === 'active');

      console.log(`👥 [AVAILABILITY CAPACITY] Processing ${activeStaff.length} active staff members`);

      // Get capacity summaries for all staff
      const staffCapacities = await this.availabilityService.getAllStaffCapacities();

      const forecastPeriods: ForecastData[] = [];

      // Generate 12 months of forecast data
      for (let i = 0; i < 12; i++) {
        const periodStart = addMonths(startOfMonth(startDate), i);
        const periodEnd = endOfMonth(periodStart);
        const periodKey = format(periodStart, 'yyyy-MM');

        const capacitySkillHours: SkillHours[] = [];
        const capacityBySkill = new Map<SkillType, number>();

        // Process each staff member
        for (const staffMember of activeStaff) {
          try {
            const staffCapacity = staffCapacities[staffMember.id];
            
            if (!staffCapacity) {
              console.warn(`No capacity data found for staff ${staffMember.fullName} (${staffMember.id})`);
              continue;
            }

            // Get monthly capacity from weekly availability
            const monthlyCapacity = this.availabilityService.calculateMonthlyCapacity(
              staffCapacity.weeklyHours,
              periodStart,
              periodEnd
            );

            // Skip staff with zero capacity
            if (monthlyCapacity <= 0) {
              console.warn(`Staff ${staffMember.fullName} has zero capacity for period ${periodKey}`);
              continue;
            }

            // Normalize staff skills
            const normalizedSkills = await normalizeSkills(
              staffMember.assignedSkills, 
              staffMember.id
            );

            if (normalizedSkills.length === 0) {
              console.warn(`Staff ${staffMember.fullName} has no normalized skills, assigning to Junior Staff`);
              normalizedSkills.push('Junior Staff');
            }

            // Distribute capacity among skills (staff splits time between skills)
            const hoursPerSkill = monthlyCapacity / normalizedSkills.length;

            normalizedSkills.forEach(skill => {
              const currentCapacity = capacityBySkill.get(skill) || 0;
              capacityBySkill.set(skill, currentCapacity + hoursPerSkill);
            });

            console.log(`✅ [STAFF CAPACITY] ${staffMember.fullName}: ${monthlyCapacity.toFixed(1)}h across ${normalizedSkills.length} skills`);

          } catch (error) {
            console.error(`Error processing staff ${staffMember.id}:`, error);
            
            // Fallback: assign fixed capacity to Junior Staff
            const fallbackSkill: SkillType = 'Junior Staff';
            const fallbackCapacity = 160; // Standard monthly hours
            const currentCapacity = capacityBySkill.get(fallbackSkill) || 0;
            capacityBySkill.set(fallbackSkill, currentCapacity + fallbackCapacity);
          }
        }

        // Convert map to SkillHours array
        capacityBySkill.forEach((hours, skill) => {
          capacitySkillHours.push({ 
            skill, 
            hours,
            metadata: {
              calculationNotes: 'Based on staff availability matrix'
            }
          });
        });

        const totalCapacityHours = Array.from(capacityBySkill.values())
          .reduce((sum, hours) => sum + hours, 0);

        console.log(`📊 [PERIOD CAPACITY] ${periodKey}: ${totalCapacityHours.toFixed(1)}h across ${capacityBySkill.size} skills`);

        forecastPeriods.push({
          period: periodKey,
          demand: [], // Will be filled by demand service
          capacity: capacitySkillHours,
          capacityHours: totalCapacityHours
        });
      }

      console.log(`✅ [AVAILABILITY CAPACITY] Generated ${forecastPeriods.length} forecast periods`);
      return forecastPeriods;

    } catch (error) {
      console.error('Error generating availability-based capacity forecast:', error);
      throw error;
    }
  }

  /**
   * Get fallback capacity when availability data is insufficient
   */
  private getFallbackCapacityForPeriod(periodKey: string): ForecastData {
    console.warn(`Using fallback capacity for period ${periodKey}`);
    
    return {
      period: periodKey,
      demand: [],
      capacity: [
        { skill: 'Junior Staff', hours: 480 }, // 3 junior staff × 160h
        { skill: 'Senior Staff', hours: 320 }, // 2 senior staff × 160h  
        { skill: 'CPA', hours: 160 }           // 1 CPA × 160h
      ],
      capacityHours: 960
    };
  }

  /**
   * Validate capacity data quality
   */
  private validateCapacityData(staffCapacities: Record<string, WeeklyCapacitySummary>): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    const staffCount = Object.keys(staffCapacities).length;
    if (staffCount === 0) {
      issues.push('No staff capacity data available');
    }

    const zeroCapacityStaff = Object.values(staffCapacities)
      .filter(summary => summary.weeklyHours <= 0).length;
    
    if (zeroCapacityStaff > 0) {
      issues.push(`${zeroCapacityStaff} staff members have zero capacity`);
    }

    const totalCapacity = Object.values(staffCapacities)
      .reduce((sum, summary) => sum + summary.weeklyHours, 0);
    
    if (totalCapacity < 40) { // Less than 1 full-time person
      issues.push(`Total firm capacity unusually low: ${totalCapacity}h/week`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
