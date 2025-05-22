import { toast as originalToast } from "@/components/ui/use-toast";

// Keep track of recent toasts to prevent duplicates
const recentToasts: Record<string, number> = {};
const TOAST_COOLDOWN = 3000; // 3 seconds cooldown between identical toasts

// Debounced toast function that prevents duplicate messages
export const toast = {
  success: (title: string, description?: string) => {
    const key = `${title}-${description || ''}`;
    const now = Date.now();
    
    // Check if this exact toast was shown recently
    if (recentToasts[key] && now - recentToasts[key] < TOAST_COOLDOWN) {
      // Skip showing this toast as it's too soon after the previous identical one
      console.log(`[Toast] Prevented duplicate toast: ${title}`);
      return;
    }
    
    // Record this toast
    recentToasts[key] = now;
    
    // Show the toast
    originalToast({
      title,
      description,
      duration: 3000, // Increase duration to 3 seconds
    });
    
    // Clean up old entries periodically
    setTimeout(() => {
      Object.keys(recentToasts).forEach(k => {
        if (now - recentToasts[k] > 60000) { // Remove entries older than 1 minute
          delete recentToasts[k];
        }
      });
    }, 60000);
  },
  
  error: (title: string, description?: string) => {
    originalToast({
      title,
      description,
      variant: "destructive",
      duration: 5000, // Longer duration for errors
    });
  },
  
  warning: (title: string, description?: string) => {
    originalToast({
      title,
      description,
      variant: "warning",
      duration: 4000,
    });
  },
  
  info: (title: string, description?: string) => {
    originalToast({
      title,
      description,
      duration: 3000,
    });
  }
};
