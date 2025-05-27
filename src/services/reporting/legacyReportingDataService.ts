
/**
 * Legacy Reporting Data Service - Backward Compatibility Layer
 * 
 * Maintains backward compatibility while using the new modular structure
 */

// Re-export everything from the new modular structure
export * from './reportingDataService';

// Re-export the global instance for backward compatibility
export { reportingDataService } from './reportingDataService';

// Default export
export { default } from './reportingDataService';

