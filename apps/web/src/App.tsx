import { MainLayout } from "@/components/layout/main-layout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./pages/Admin.js";
import Index from "./pages/Index.js";
import Insights from "./pages/Insights.js";
import NotFound from "./pages/NotFound.js";
import Personal from "./pages/Personal.js";
import Templates from "./pages/Templates.js";
import Variables from "./pages/Variables.js";
import WorkflowEditor from "./pages/WorkflowEditor.js";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Index />
              </MainLayout>
            }
          />
          <Route
            path="/personal"
            element={
              <MainLayout>
                <Personal />
              </MainLayout>
            }
          />
          <Route path="/workflow-editor" element={<WorkflowEditor />} />
          <Route
            path="/admin"
            element={
              <MainLayout>
                <Admin />
              </MainLayout>
            }
          />
          <Route
            path="/templates"
            element={
              <MainLayout>
                <Templates />
              </MainLayout>
            }
          />
          <Route
            path="/variables"
            element={
              <MainLayout>
                <Variables />
              </MainLayout>
            }
          />
          <Route
            path="/insights"
            element={
              <MainLayout>
                <Insights />
              </MainLayout>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={
              <MainLayout>
                <NotFound />
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
