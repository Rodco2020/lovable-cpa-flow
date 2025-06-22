
/**
 * Staff ID Extractor Service
 * 
 * Handles extraction and validation of staff IDs from various formats
 */

export class StaffIdExtractor {
  /**
   * Extract staff ID from various staff reference formats with proper type safety
   */
  static extractStaffId(staffRef: string | { staffId: string; full_name: string; } | null): string | null {
    if (!staffRef) return null;

    if (typeof staffRef === 'string') {
      return staffRef.trim() || null;
    }

    if (typeof staffRef === 'object' && 'staffId' in staffRef) {
      return staffRef.staffId?.trim() || null;
    }

    return null;
  }

  /**
   * Safe staff ID extraction with proper type checking
   */
  static safeExtractStaffId(staffRef: string | { staffId: string; full_name: string; } | null): string | null {
    if (!staffRef) return null;

    if (typeof staffRef === 'string') {
      return staffRef.trim() || null;
    }

    if (typeof staffRef === 'object' && 'staffId' in staffRef) {
      return staffRef.staffId?.trim() || null;
    }

    return null;
  }

  /**
   * Validate staff reference structure
   */
  static isValidStaffReference(staffRef: any): boolean {
    if (!staffRef) return false;

    if (typeof staffRef === 'string') {
      return staffRef.trim().length > 0;
    }

    if (typeof staffRef === 'object') {
      const staffId = staffRef.staffId || staffRef.id || staffRef.full_name || staffRef.name;
      return staffId && typeof staffId === 'string' && staffId.trim().length > 0;
    }

    return false;
  }
}
