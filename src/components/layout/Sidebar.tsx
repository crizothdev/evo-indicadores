import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { usePendingUsers } from '@/hooks/usePendingUsers';
import {
  LayoutDashboard, Building2, Upload, MessageSquare, Trophy,
  Eye, Users, Settings, Calendar, LogOut, ChevronLeft, ChevronRight, Store
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Role } from '@/types';

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const role = (user?.role ?? 'franchise') as Role;
  const isFranchise = role === 'franchise';
  const { data: pendingUsers = [] } = usePendingUsers();
  const pendingCount = pendingUsers.length;

  const navItems = [
    {
      to: isFranchise ? '/minha-franquia' : '/dashboard',
      icon: isFranchise ? Store : LayoutDashboard,
      label: isFranchise ? 'Minha Franquia' : 'Dashboard',
      permission: 'canViewDashboard' as const,
    },
    { to: '/unidades', icon: Building2, label: 'Unidades', permission: 'canViewAllUnits' as const },
    { to: '/importacao', icon: Upload, label: 'Importação', permission: 'canImport' as const },
    { to: '/avisos', icon: MessageSquare, label: 'Avisos', permission: 'canViewDashboard' as const },
    { to: '/top5', icon: Trophy, label: 'TOP 5', permission: 'canAuditTop5' as const },
    { to: '/acompanhamento', icon: Eye, label: 'Acompanhamento', permission: 'canManageFollowUp' as const },
    { to: '/agenda', icon: Calendar, label: 'Agenda', permission: 'canViewDashboard' as const },
    { to: '/usuarios', icon: Users, label: 'Usuários', permission: 'canManageUsers' as const },
    { to: '/configuracoes', icon: Settings, label: 'Configurações', permission: 'canConfigure' as const },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (item.to === '/agenda') {
      return hasPermission(role, 'canManageAgenda') || hasPermission(role, 'canRequestAppointment');
    }
    return hasPermission(role, item.permission);
  });

  return (
    <aside className={cn(
      'flex flex-col bg-sidebar transition-all duration-200',
      collapsed ? 'w-16' : 'w-64'
    )} style={{ borderRight: '1px solid #eee' }}>
      <div className="flex items-center gap-2.5" style={{ padding: '10px', marginBottom: '12px' }}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">E</span>
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">EVO</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-sidebar-border" style={{ padding: '10px', marginBottom: '16px' }}>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {user?.name?.charAt(0) ?? 'U'}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: '#D0D0D0', margin: '10px 10px 16px' }} />

      {!collapsed && (
        <p className="pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
          Navegação
        </p>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto" style={{ padding: '0 10px' }}>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary'
                  : 'hover:bg-sidebar-accent',
                collapsed && 'justify-center px-2'
              )}
              style={{
                color: isActive ? '#fff' : '#343A40',
                paddingTop: '12px',
                paddingBottom: '12px',
                paddingLeft: '10px',
                paddingRight: '10px',
                borderRadius: '6px',
              }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: isActive ? '#fff' : '#6C757D' }} />
              {!collapsed && <span>{item.label}</span>}
              {item.to === '/usuarios' && pendingCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold"
                  style={{ background: isActive ? '#fff' : '#DC3545', color: isActive ? '#DC3545' : '#fff' }}
                >
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border" style={{ padding: '10px' }}>
        {!collapsed && (
          <p className="px-1 pb-2 text-[10px] text-muted-foreground">Evo Indicadores v1.0</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn('w-full justify-start text-muted-foreground', collapsed && 'justify-center px-2')}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
