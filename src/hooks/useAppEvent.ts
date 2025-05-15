
import { useEffect } from "react";
import eventService, { AppEventType, AppEvent } from "@/services/eventService";

/**
 * Hook to subscribe to application events
 */
export function useAppEvent<T = any>(
  eventType: AppEventType, 
  handler: (event: AppEvent<T>) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = eventService.subscribe<T>(eventType, handler);
    return unsubscribe;
  }, [eventType, ...deps]);
}

/**
 * Hook to subscribe to multiple application events
 */
export function useAppEvents(
  eventTypes: AppEventType[], 
  handler: (event: AppEvent) => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const unsubscribe = eventService.subscribeToMany(eventTypes, handler);
    return unsubscribe;
  }, [JSON.stringify(eventTypes), ...deps]);
}

/**
 * Hook to publish application events
 */
export function useEventPublisher() {
  return {
    publishEvent: eventService.publish
  };
}

export default useAppEvent;
