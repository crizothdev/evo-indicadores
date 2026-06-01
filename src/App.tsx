import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { AppLayout } from '@/components/layout/AppLayout';
import { TooltipProvider } from '@/components/ui/tooltip';
import LoginPage from '@/pages/LoginPage';
import RegistrarPage from '@/pages/RegistrarPage';
import AguardandoAprovacaoPage from '@/pages/AguardandoAprovacaoPage';
import DashboardPage from '@/pages/DashboardPage';
import FranquiaDashboardPage from '@/pages/FranquiaDashboardPage';
import UnidadesPage from '@/pages/UnidadesPage';
import UnidadeDetalhePage from '@/pages/UnidadeDetalhePage';
import ImportacaoPage from '@/pages/ImportacaoPage';
import UsuariosPage from '@/pages/UsuariosPage';
import AvisosPage from '@/pages/AvisosPage';
import Top5Page from '@/pages/Top5Page';
import AcompanhamentoPage from '@/pages/AcompanhamentoPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import AgendaPage from '@/pages/AgendaPage';
import type { Role } from '@/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

function getHomePath(role?: string): string {
  return role === 'franchise' ? '/minha-franquia' : '/dashboard';
}

function ProtectedRoute({ children, requiredPermission }: { children: React.ReactNode; requiredPermission?: string }) {
  const { user, isAuthenticated, isApproved, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isApproved) return <Navigate to="/aguardando-aprovacao" replace />;
  if (requiredPermission && user && !hasPermission(user.role as Role, requiredPermission as any)) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }
  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'franchise') return <Navigate to="/minha-franquia" replace />;
  return <DashboardPage />;
}

function AppRoutes() {
  const { user, isAuthenticated, isApproved, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  const homePath = getHomePath(user?.role);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={homePath} replace /> : <LoginPage />} />
      <Route path="/registrar" element={isAuthenticated ? <Navigate to={homePath} replace /> : <RegistrarPage />} />
      <Route path="/aguardando-aprovacao" element={!isAuthenticated ? <Navigate to="/login" replace /> : isApproved ? <Navigate to={homePath} replace /> : <AguardandoAprovacaoPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/minha-franquia" element={<ProtectedRoute><FranquiaDashboardPage /></ProtectedRoute>} />
        <Route path="/unidades" element={<ProtectedRoute requiredPermission="canViewAllUnits"><UnidadesPage /></ProtectedRoute>} />
        <Route path="/unidades/:id" element={<ProtectedRoute requiredPermission="canViewAllUnits"><UnidadeDetalhePage /></ProtectedRoute>} />
        <Route path="/importacao" element={<ProtectedRoute requiredPermission="canImport"><ImportacaoPage /></ProtectedRoute>} />
        <Route path="/avisos" element={<AvisosPage />} />
        <Route path="/top5" element={<ProtectedRoute requiredPermission="canAuditTop5"><Top5Page /></ProtectedRoute>} />
        <Route path="/acompanhamento" element={<ProtectedRoute requiredPermission="canManageFollowUp"><AcompanhamentoPage /></ProtectedRoute>} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/usuarios" element={<ProtectedRoute requiredPermission="canManageUsers"><UsuariosPage /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute requiredPermission="canConfigure"><ConfiguracoesPage /></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute requiredPermission="canViewReports"><RelatoriosPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
