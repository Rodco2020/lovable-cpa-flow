
/**
 * Performance Monitoring Service - Main Export
 * 
 * Maintains backward compatibility while using the new modular performance system
 */

// Re-export everything from the new performance module
export * from './performance';

// Re-export the global instance for backward compatibility
export { performanceMonitoringService } from './performance';

// Default export
export { default } from './performance';
