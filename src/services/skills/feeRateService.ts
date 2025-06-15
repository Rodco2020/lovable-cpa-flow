
import { getAllSkills } from './skillsService';
import { Skill } from '@/types/skill';

/**
 * Fee Rate Service
 * 
 * Provides efficient lookup methods for skill fee rates to support revenue calculations
 * in the forecasting system.
 */

export interface SkillFeeRate {
  skillName: string;
  feePerHour: number;
}

export interface SkillFeeRateMap {
  [skillName: string]: number;
}

/**
 * Get skill fee rates as a Map for efficient lookups
 * @returns Promise<Map<string, number>> - Map of skill names to fee rates
 */
export const getSkillFeeRatesMap = async (): Promise<Map<string, number>> => {
  try {
    const skills = await getAllSkills();
    const feeRatesMap = new Map<string, number>();
    
    skills.forEach(skill => {
      if (skill.feePerHour && skill.feePerHour > 0) {
        feeRatesMap.set(skill.name, skill.feePerHour);
      }
    });
    
    return feeRatesMap;
  } catch (error) {
    console.error('Error fetching skill fee rates map:', error);
    throw new Error('Failed to fetch skill fee rates');
  }
};

/**
 * Get skill fee rates as an object for convenient access
 * @returns Promise<SkillFeeRateMap> - Object mapping skill names to fee rates
 */
export const getSkillFeeRates = async (): Promise<SkillFeeRateMap> => {
  try {
    const skills = await getAllSkills();
    const feeRates: SkillFeeRateMap = {};
    
    skills.forEach(skill => {
      if (skill.feePerHour && skill.feePerHour > 0) {
        feeRates[skill.name] = skill.feePerHour;
      }
    });
    
    return feeRates;
  } catch (error) {
    console.error('Error fetching skill fee rates:', error);
    throw new Error('Failed to fetch skill fee rates');
  }
};

/**
 * Get fee rate for a specific skill by name
 * @param skillName - Name of the skill
 * @returns Promise<number | null> - Fee rate or null if not found
 */
export const getSkillFeeRate = async (skillName: string): Promise<number | null> => {
  try {
    const feeRatesMap = await getSkillFeeRatesMap();
    return feeRatesMap.get(skillName) || null;
  } catch (error) {
    console.error(`Error fetching fee rate for skill ${skillName}:`, error);
    return null;
  }
};

/**
 * Get fee rates for multiple skills
 * @param skillNames - Array of skill names
 * @returns Promise<SkillFeeRate[]> - Array of skill fee rate objects
 */
export const getMultipleSkillFeeRates = async (skillNames: string[]): Promise<SkillFeeRate[]> => {
  try {
    const feeRatesMap = await getSkillFeeRatesMap();
    
    return skillNames.map(skillName => ({
      skillName,
      feePerHour: feeRatesMap.get(skillName) || 0
    }));
  } catch (error) {
    console.error('Error fetching multiple skill fee rates:', error);
    throw new Error('Failed to fetch multiple skill fee rates');
  }
};

/**
 * Calculate total revenue for skills with hours
 * @param skillHours - Object mapping skill names to hours
 * @returns Promise<number> - Total calculated revenue
 */
export const calculateSkillsRevenue = async (skillHours: Record<string, number>): Promise<number> => {
  try {
    const feeRatesMap = await getSkillFeeRatesMap();
    let totalRevenue = 0;
    
    Object.entries(skillHours).forEach(([skillName, hours]) => {
      const feeRate = feeRatesMap.get(skillName) || 0;
      totalRevenue += hours * feeRate;
    });
    
    return totalRevenue;
  } catch (error) {
    console.error('Error calculating skills revenue:', error);
    throw new Error('Failed to calculate skills revenue');
  }
};

/**
 * Get default fee rates for critical skills (fallback)
 * @returns SkillFeeRateMap - Default fee rates
 */
export const getDefaultFeeRates = (): SkillFeeRateMap => {
  return {
    'CPA': 250.00,
    'Senior': 150.00,
    'Junior': 100.00
  };
};
