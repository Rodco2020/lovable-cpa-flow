
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageShell from "@/components/layout/PageShell";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TaskModule from "./pages/TaskModule";
import ClientModule from "./pages/ClientModule";
import StaffModule from "./pages/StaffModule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageShell>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tasks/*" element={<TaskModule />} />
            <Route path="/clients/*" element={<ClientModule />} />
            <Route path="/staff/*" element={<StaffModule />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
