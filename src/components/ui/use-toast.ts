
import { useToast as useToastOriginal } from "@/hooks/use-toast";
import type { ToastProps } from "@/components/ui/toast";

// Re-export the hook directly
export const useToast = useToastOriginal;

// We need to define the variant type properly
// Update the ToastVariants type to match what's available in the component
type ToastVariants = "default" | "destructive";

// Export a properly typed version of the toast function
export interface ExtendedToastProps extends Omit<ToastProps, "variant"> {
  variant?: ToastVariants;
}

// Re-export the toast function - we'll access it through the hook
export { toast } from "@/hooks/use-toast";
