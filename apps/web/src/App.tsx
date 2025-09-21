import { MainLayout } from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./pages/Admin.js";
import FormPage from "./pages/Form.tsx";
import Index from "./pages/Index.js";
import Insights from "./pages/Insights.js";
import NotFound from "./pages/NotFound.js";
import Personal from "./pages/Personal.js";
import SignIn from "./pages/SignIn.js";
import SignUp from "./pages/SignUp.js";
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
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/form/:execution_id" element={<FormPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Personal />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflow-editor"
              element={
                <ProtectedRoute>
                  <WorkflowEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Admin />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Templates />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/variables"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Variables />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Insights />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <NotFound />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
