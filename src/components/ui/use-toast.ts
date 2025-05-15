
import { useToast as useToastHook, toast } from "@/hooks/use-toast";

// Creating a proper type that extends the original toast interface
type ExtendedToast = typeof toast & {
  (props: Parameters<typeof toast>[0] & { variant?: "default" | "destructive" | "warning" }): void;
};

// Extend the toast function to accept "warning" as a variant
export const useToast = useToastHook;
export const toast = useToastHook().toast as ExtendedToast;
