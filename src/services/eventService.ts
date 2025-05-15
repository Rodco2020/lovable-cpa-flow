
import { Subject } from "rxjs";

// Event types for the entire application
export type AppEventType = 
  // Availability events
  | "availability.updated" 
  | "availability.template.changed"
  // Staff events
  | "staff.updated"
  | "staff.created"
  | "staff.deleted"
  // Task events
  | "task.scheduled"
  | "task.unscheduled"
  | "task.completed"
  // Forecast events
  | "forecast.recalculated";

// Event payload interface
export interface AppEvent<T = any> {
  type: AppEventType;
  payload: T;
  timestamp: number;
  source?: string;
}

// Create a subject for the event bus
const eventSubject = new Subject<AppEvent>();

// Event service for publishing and subscribing to events
const eventService = {
  /**
   * Publish an event to the event bus
   */
  publish<T>(event: Omit<AppEvent<T>, "timestamp">) {
    const fullEvent: AppEvent<T> = {
      ...event,
      timestamp: Date.now(),
    };
    console.log(`[Event] Publishing: ${event.type}`, event.payload);
    eventSubject.next(fullEvent);
  },

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T>(type: AppEventType, handler: (event: AppEvent<T>) => void) {
    const subscription = eventSubject
      .subscribe(event => {
        if (event.type === type) {
          handler(event as AppEvent<T>);
        }
      });
    
    // Return unsubscribe function
    return () => subscription.unsubscribe();
  },

  /**
   * Subscribe to multiple event types
   */
  subscribeToMany(types: AppEventType[], handler: (event: AppEvent) => void) {
    const subscription = eventSubject
      .subscribe(event => {
        if (types.includes(event.type)) {
          handler(event);
        }
      });
    
    // Return unsubscribe function
    return () => subscription.unsubscribe();
  }
};

export default eventService;
