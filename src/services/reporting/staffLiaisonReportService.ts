
/**
 * Staff Liaison Report Service - Backward Compatibility Layer
 * 
 * Maintains backward compatibility while using the new modular structure
 */

// Re-export everything from the new modular structure
export {
  StaffLiaisonReportService,
  staffLiaisonReportService,
  getStaffLiaisonReportData,
  getClientTasksByLiaison
} from './staffLiaison/staffLiaisonReportService';

// Default export for backward compatibility
export { default } from './staffLiaison/staffLiaisonReportService';
