
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import Navigation from "@/components/Navigation";
import Index from "@/pages/Index";
import TaskModule from "@/pages/TaskModule";
import ClientModule from "@/pages/ClientModule";
import StaffModule from "@/pages/StaffModule";
import ForecastingModule from "@/pages/ForecastingModule";
import SchedulerModule from "@/pages/SchedulerModule";
import SkillsModule from "@/pages/SkillsModule";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 404s or client errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Retry mutations once
    },
  },
});

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Application Error:', error);
        console.error('Error Info:', errorInfo);
        
        // You could send this to an error reporting service here
        // Example: errorReportingService.report(error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <ErrorBoundary
                      fallback={
                        <div className="text-center py-8">
                          <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            Page Loading Error
                          </h2>
                          <p className="text-gray-600">
                            There was an issue loading this page. Please try refreshing or navigate to another section.
                          </p>
                        </div>
                      }
                    >
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/tasks" element={<TaskModule />} />
                        <Route path="/clients" element={<ClientModule />} />
                        <Route path="/staff" element={<StaffModule />} />
                        <Route path="/forecasting" element={<ForecastingModule />} />
                        <Route path="/scheduler" element={<SchedulerModule />} />
                        <Route path="/skills" element={<SkillsModule />} />
                      </Routes>
                    </ErrorBoundary>
                  </main>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </SupabaseProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
