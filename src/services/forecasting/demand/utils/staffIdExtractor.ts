
/**
 * Staff ID Extraction Utility
 * 
 * Provides safe extraction of staff IDs from union types used in preferred staff handling.
 * This utility centralizes the logic for handling both string and object representations
 * of preferred staff data.
 */

export function extractStaffId(preferredStaff: string | { staffId: string; full_name: string } | null | undefined): string | null {
  if (!preferredStaff) {
    return null;
  }
  
  if (typeof preferredStaff === 'string') {
    return preferredStaff;
  }
  
  if (typeof preferredStaff === 'object' && 'staffId' in preferredStaff) {
    return preferredStaff.staffId || null;
  }
  
  return null;
}

export function extractStaffName(preferredStaff: string | { staffId: string; full_name: string } | null | undefined): string | null {
  if (!preferredStaff) {
    return null;
  }
  
  if (typeof preferredStaff === 'string') {
    return preferredStaff; // Use ID as name fallback
  }
  
  if (typeof preferredStaff === 'object' && 'full_name' in preferredStaff) {
    return preferredStaff.full_name || preferredStaff.staffId || null;
  }
  
  return null;
}

export function normalizePreferredStaff(preferredStaff: string | { staffId: string; full_name: string } | null | undefined): { staffId: string; full_name: string } | null {
  const staffId = extractStaffId(preferredStaff);
  const staffName = extractStaffName(preferredStaff);
  
  if (!staffId) {
    return null;
  }
  
  return {
    staffId,
    full_name: staffName || staffId
  };
}
