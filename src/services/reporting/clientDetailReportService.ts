
/**
 * Client Detail Report Service - Backward Compatibility Layer
 * 
 * Maintains backward compatibility while using the new modular structure
 */

// Re-export everything from the new modular structure
export {
  ClientDetailReportService,
  clientDetailReportService,
  getClientDetailReport,
  getClientsList
} from './clientDetail/clientDetailReportService';

// Default export for backward compatibility
export { default } from './clientDetail/clientDetailReportService';
