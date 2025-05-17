import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ClientsPage from "./pages/dashboard/ClientsPage";
import FournisseursPage from "./pages/dashboard/FournisseursPage";
import StockPage from "./pages/dashboard/StockPage";
import SalesPage from "./pages/SalesPage";
import QuotesPage from "./pages/QuotesPage";
import ParametresPage from "./pages/dashboard/ParametresPage";
import TeamPage from "./pages/dashboard/TeamPage";
import PlaceholderPage from "./pages/dashboard/PlaceholderPage";
import AdminPage from "./pages/dashboard/AdminPage";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import TaskPage from './pages/dashboard/TaskPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Routes protégées du dashboard */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }>
                <Route index element={<DashboardHome />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="fournisseurs" element={<FournisseursPage />} />
                <Route path="stock" element={<StockPage />} />
                <Route path="ventes" element={<SalesPage />} />
                <Route path="devis" element={<QuotesPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="tasks" element={<TaskPage />} />
                <Route path="livraisons" element={<PlaceholderPage />} />
                <Route path="factures" element={<PlaceholderPage />} />
                <Route path="parametres" element={<ParametresPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>
              
              {/* Redirection et page 404 */}
              <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
