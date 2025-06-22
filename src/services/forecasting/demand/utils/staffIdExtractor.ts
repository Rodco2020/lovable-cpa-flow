
/**
 * Staff ID Extractor Utility
 * 
 * Safely extracts staff ID from various preferred staff formats
 */

export function extractStaffId(preferredStaff: string | { staffId: string; full_name: string } | null): string | null {
  if (!preferredStaff) return null;
  if (typeof preferredStaff === 'string') return preferredStaff;
  return preferredStaff.staffId || null;
}
