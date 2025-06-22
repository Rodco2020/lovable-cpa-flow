
/**
 * Staff Extraction Utilities
 * Helper functions for safely extracting staff data from various formats
 */

/**
 * Safely extract staff ID from various staff reference formats
 */
export const extractStaffId = (staffRef: string | { staffId: string; full_name: string; } | null): string | null => {
  if (!staffRef) return null;

  if (typeof staffRef === 'string') {
    return staffRef.trim() || null;
  }

  if (typeof staffRef === 'object' && 'staffId' in staffRef) {
    return staffRef.staffId?.trim() || null;
  }

  return null;
};

/**
 * Safely extract staff name from various staff reference formats
 */
export const extractStaffName = (staffRef: string | { staffId: string; full_name: string; } | null): string | null => {
  if (!staffRef) return null;

  if (typeof staffRef === 'string') {
    return staffRef; // If it's just a string, assume it's the name
  }

  if (typeof staffRef === 'object' && 'full_name' in staffRef) {
    return staffRef.full_name || null;
  }

  return null;
};

/**
 * Type guard to check if staffRef is an object with staffId
 */
export const isStaffObject = (staffRef: any): staffRef is { staffId: string; full_name: string; } => {
  return staffRef && typeof staffRef === 'object' && 'staffId' in staffRef;
};
