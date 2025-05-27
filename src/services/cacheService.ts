
/**
 * Cache Service - Main Export
 * 
 * Maintains backward compatibility while using the new modular cache system
 */

// Re-export everything from the new cache module
export * from './cache';

// Re-export the global instances for backward compatibility
export { queryCache, reportCache, metadataCache } from './cache';

// Default export
export { default } from './cache';
