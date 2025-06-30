
import { SkillResolutionService } from '@/services/forecasting/demand/skillResolutionService';

/**
 * Grid Layout Utilities for Demand Matrix
 * 
 * Handles layout calculations and grid structure logic with skill name resolution
 */

/**
 * Get the display label for a row (skill or client) with UUID resolution
 */
export const getRowLabel = async (skillOrClient: string): Promise<string> => {
  // Check if it's a UUID that needs resolution
  if (isUUID(skillOrClient)) {
    try {
      console.log(`🔍 [GRID UTILS] Resolving UUID: ${skillOrClient}`);
      const resolvedNames = await SkillResolutionService.getSkillNames([skillOrClient]);
      const resolvedName = resolvedNames[0] || skillOrClient;
      console.log(`🔍 [GRID UTILS] UUID ${skillOrClient} -> ${resolvedName}`);
      return resolvedName;
    } catch (error) {
      console.warn(`⚠️ [GRID UTILS] Failed to resolve UUID ${skillOrClient}:`, error);
      return skillOrClient; // Fallback to original value
    }
  }
  
  // For both skill and client modes, return the display name as-is
  return skillOrClient;
};

/**
 * Synchronous version of getRowLabel for backwards compatibility
 */
export const getRowLabelSync = (skillOrClient: string): string => {
  // For display purposes, return the value as-is
  // The async resolution should have already been handled in the data transformation
  return skillOrClient;
};

/**
 * Check if a string is a UUID
 */
export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Validate that a skill name is properly resolved (not a UUID)
 */
export const validateSkillName = (skillName: string): boolean => {
  if (isUUID(skillName)) {
    console.warn(`⚠️ [GRID UTILS] Skill name validation failed - UUID detected: ${skillName}`);
    return false;
  }
  
  if (!skillName || skillName.trim().length === 0) {
    console.warn(`⚠️ [GRID UTILS] Skill name validation failed - empty or null: ${skillName}`);
    return false;
  }
  
  return true;
};

/**
 * Calculate grid template rows based on data
 */
export const calculateGridTemplateRows = (rowCount: number, additionalRows: number): string => {
  return `auto repeat(${rowCount + additionalRows}, auto)`;
};

/**
 * Log matrix rendering information for debugging
 */
export const logMatrixRendering = (groupingMode: 'skill' | 'client', rowItemsCount: number, monthsCount: number): void => {
  console.log(`🎯 [MATRIX GRID] Rendering ${groupingMode} matrix with ${rowItemsCount} ${groupingMode}s and ${monthsCount} months`);
};

/**
 * Batch resolve multiple skill UUIDs to display names
 */
export const batchResolveSkillNames = async (skillRefs: string[]): Promise<Map<string, string>> => {
  const resolutionMap = new Map<string, string>();
  
  try {
    const uuids = skillRefs.filter(ref => isUUID(ref));
    const nonUuids = skillRefs.filter(ref => !isUUID(ref));
    
    // Resolve UUIDs
    if (uuids.length > 0) {
      const resolvedNames = await SkillResolutionService.getSkillNames(uuids);
      uuids.forEach((uuid, index) => {
        resolutionMap.set(uuid, resolvedNames[index] || uuid);
      });
    }
    
    // Map non-UUIDs to themselves
    nonUuids.forEach(name => {
      resolutionMap.set(name, name);
    });
    
    console.log(`🔍 [GRID UTILS] Batch resolved ${skillRefs.length} skill references:`, {
      totalRefs: skillRefs.length,
      uuidsResolved: uuids.length,
      nonUuidsPreserved: nonUuids.length,
      resolutionMap: Object.fromEntries(resolutionMap)
    });
    
  } catch (error) {
    console.error('❌ [GRID UTILS] Error in batch skill resolution:', error);
    
    // Fallback: map all to themselves
    skillRefs.forEach(ref => {
      resolutionMap.set(ref, ref);
    });
  }
  
  return resolutionMap;
};
