
import React, { createContext, useContext, useCallback, ReactNode } from 'react';

// Define event types for type safety
type EventAction = 
  | 'start_copy_workflow'
  | 'select_client' 
  | 'select_tasks'
  | 'execute_copy'
  | 'complete_copy'
  | 'cancel_workflow'
  | 'error_occurred';

// Define payload types
type EventPayload = Record<string, any>;

type AnalyticsContextType = {
  trackEvent: (action: EventAction, payload?: EventPayload) => void;
  trackPageView: (page: string) => void;
  trackTiming: (category: string, variable: string, value: number) => void;
};

// Create context with default implementation
const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  trackPageView: () => {},
  trackTiming: () => {},
});

export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
  disabled?: boolean;
}

/**
 * Analytics Provider component that enables tracking events throughout the application
 * This is designed to be non-invasive and configurable, with easy integration paths
 * to common analytics services like Google Analytics, Mixpanel, or custom solutions.
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children,
  disabled = false,
}) => {
  // Track a specific event with optional payload
  const trackEvent = useCallback((action: EventAction, payload: EventPayload = {}) => {
    if (disabled) return;
    
    try {
      // Log for development/debugging
      console.debug(`[Analytics] Event: ${action}`, payload);
      
      // Integration point for analytics services
      // For example, if using Google Analytics:
      if (window.gtag) {
        window.gtag('event', action, payload);
      }
      
      // If using a custom analytics endpoint:
      // fetch('/api/analytics/event', {
      //   method: 'POST',
      //   body: JSON.stringify({ action, payload, timestamp: new Date().toISOString() })
      // });
    } catch (error) {
      // Silently handle analytics errors to prevent disrupting the app
      console.error('[Analytics] Error tracking event:', error);
    }
  }, [disabled]);
  
  // Track page view
  const trackPageView = useCallback((page: string) => {
    if (disabled) return;
    
    try {
      console.debug(`[Analytics] Page view: ${page}`);
      
      // Integration point for page view tracking
      if (window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: page
        });
      }
    } catch (error) {
      console.error('[Analytics] Error tracking page view:', error);
    }
  }, [disabled]);
  
  // Track timing metrics
  const trackTiming = useCallback((category: string, variable: string, value: number) => {
    if (disabled) return;
    
    try {
      console.debug(`[Analytics] Timing: ${category} - ${variable}: ${value}ms`);
      
      // Integration point for timing tracking
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: variable,
          value,
          event_category: category
        });
      }
    } catch (error) {
      console.error('[Analytics] Error tracking timing:', error);
    }
  }, [disabled]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView, trackTiming }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Type declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}
