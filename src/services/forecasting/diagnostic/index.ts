/**
 * Forecasting Diagnostic Services
 * 
 * Tools for troubleshooting revenue and forecasting issues
 */

export { RevenueDiagnostic } from './revenueDiagnostic';

// Global diagnostic helper for console access
if (typeof window !== 'undefined') {
  (window as any).RevenueDiagnostic = require('./revenueDiagnostic').RevenueDiagnostic;
}