
import { supabase } from '@/integrations/supabase/client';

export interface StaffUuidResolution {
  id: string;
  full_name: string;
  email?: string;
  normalized_name: string;
}

/**
 * Service to resolve staff names to UUIDs dynamically
 * This ensures we always use proper UUIDs for filtering instead of hardcoded names
 */
export class UuidResolutionService {
  private static staffCache = new Map<string, StaffUuidResolution[]>();
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all staff members from the database
   */
  static async getAllStaff(): Promise<StaffUuidResolution[]> {
    console.log('🔍 [UUID RESOLUTION] Fetching all staff members');
    
    // Check cache first
    const now = Date.now();
    if (this.staffCache.has('all') && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      console.log('✅ [UUID RESOLUTION] Using cached staff data');
      return this.staffCache.get('all') || [];
    }

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, email')
        .eq('status', 'active');

      if (error) {
        console.error('❌ [UUID RESOLUTION] Error fetching staff:', error);
        throw error;
      }

      const staffList: StaffUuidResolution[] = (data || []).map(staff => ({
        id: staff.id,
        full_name: staff.full_name,
        email: staff.email,
        normalized_name: staff.full_name.toLowerCase().trim()
      }));

      // Update cache
      this.staffCache.set('all', staffList);
      this.cacheTimestamp = now;

      console.log('✅ [UUID RESOLUTION] Fetched staff members:', {
        count: staffList.length,
        staff: staffList.map(s => ({ id: s.id, name: s.full_name }))
      });

      return staffList;
    } catch (error) {
      console.error('❌ [UUID RESOLUTION] Failed to fetch staff:', error);
      return [];
    }
  }

  /**
   * Resolve staff names to UUIDs
   * Supports partial matching and various name formats
   */
  static async resolveStaffNamesToUuids(names: (string | number | null | undefined)[]): Promise<string[]> {
    console.log('🔍 [UUID RESOLUTION] Resolving staff names to UUIDs:', names);

    const validNames = names
      .filter(name => name && typeof name === 'string' && name.trim().length > 0)
      .map(name => (name as string).toLowerCase().trim());

    if (validNames.length === 0) {
      console.log('⚠️ [UUID RESOLUTION] No valid names to resolve');
      return [];
    }

    const allStaff = await this.getAllStaff();
    const resolvedUuids: string[] = [];

    for (const searchName of validNames) {
      console.log(`🔍 [UUID RESOLUTION] Searching for: "${searchName}"`);
      
      // Try exact match first
      let match = allStaff.find(staff => 
        staff.normalized_name === searchName ||
        staff.full_name.toLowerCase() === searchName
      );

      // If no exact match, try partial matching
      if (!match) {
        match = allStaff.find(staff => {
          const nameParts = staff.normalized_name.split(' ');
          const searchParts = searchName.split(' ');
          
          // Check if all search parts are found in staff name parts
          return searchParts.every(searchPart => 
            nameParts.some(namePart => 
              namePart.includes(searchPart) || searchPart.includes(namePart)
            )
          );
        });
      }

      if (match) {
        console.log(`✅ [UUID RESOLUTION] Found match: "${searchName}" -> ${match.id} (${match.full_name})`);
        resolvedUuids.push(match.id);
      } else {
        console.warn(`⚠️ [UUID RESOLUTION] No match found for: "${searchName}"`);
      }
    }

    console.log('✅ [UUID RESOLUTION] Resolution complete:', {
      originalNames: names,
      resolvedUuids: resolvedUuids,
      successRate: `${resolvedUuids.length}/${validNames.length}`
    });

    return resolvedUuids;
  }

  /**
   * Find staff by UUID
   */
  static async findStaffByUuid(uuid: string): Promise<StaffUuidResolution | null> {
    const allStaff = await this.getAllStaff();
    return allStaff.find(staff => staff.id === uuid) || null;
  }

  /**
   * Find staff by name (returns first match)
   */
  static async findStaffByName(name: string): Promise<StaffUuidResolution | null> {
    const uuids = await this.resolveStaffNamesToUuids([name]);
    if (uuids.length === 0) return null;
    
    return await this.findStaffByUuid(uuids[0]);
  }

  /**
   * Clear the cache
   */
  static clearCache(): void {
    this.staffCache.clear();
    this.cacheTimestamp = 0;
    console.log('🧹 [UUID RESOLUTION] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    cacheSize: number;
    cacheAge: number;
    isValid: boolean;
  } {
    const now = Date.now();
    return {
      cacheSize: this.staffCache.size,
      cacheAge: now - this.cacheTimestamp,
      isValid: (now - this.cacheTimestamp) < this.CACHE_TTL
    };
  }
}
