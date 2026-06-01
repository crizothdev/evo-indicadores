import type { Role } from '@/types';

export interface RolePermissions {
  canViewAllUnits: boolean;
  canViewDashboard: boolean;
  canImport: boolean;
  canManageUsers: boolean;
  canManageNotices: boolean;
  canAuditTop5: boolean;
  canManageFollowUp: boolean;
  canConfigure: boolean;
  canViewReports: boolean;
  canManageAgenda: boolean;
  canRequestAppointment: boolean;
}

const rolePermissions: Record<Role, RolePermissions> = {
  admin: {
    canViewAllUnits: true,
    canViewDashboard: true,
    canImport: true,
    canManageUsers: true,
    canManageNotices: true,
    canAuditTop5: true,
    canManageFollowUp: true,
    canConfigure: true,
    canViewReports: true,
    canManageAgenda: true,
    canRequestAppointment: false,
  },
  franchise: {
    canViewAllUnits: false,
    canViewDashboard: true,
    canImport: false,
    canManageUsers: false,
    canManageNotices: false,
    canAuditTop5: false,
    canManageFollowUp: false,
    canConfigure: false,
    canViewReports: false,
    canManageAgenda: false,
    canRequestAppointment: true,
  },
  operacional: {
    canViewAllUnits: true,
    canViewDashboard: true,
    canImport: true,
    canManageUsers: false,
    canManageNotices: false,
    canAuditTop5: false,
    canManageFollowUp: true,
    canConfigure: false,
    canViewReports: true,
    canManageAgenda: false,
    canRequestAppointment: true,
  },
  expansao: {
    canViewAllUnits: true,
    canViewDashboard: true,
    canImport: false,
    canManageUsers: false,
    canManageNotices: false,
    canAuditTop5: false,
    canManageFollowUp: false,
    canConfigure: false,
    canViewReports: true,
    canManageAgenda: false,
    canRequestAppointment: false,
  },
};

export function getPermissions(role: Role): RolePermissions {
  return rolePermissions[role];
}

export function hasPermission(role: Role, permission: keyof RolePermissions): boolean {
  return rolePermissions[role]?.[permission] ?? false;
}

export const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  franchise: 'Franquia',
  operacional: 'Operacional',
  expansao: 'Expansao',
};

export const roleColors: Record<Role, { bg: string; text: string }> = {
  admin: { bg: 'bg-accent', text: 'text-primary' },
  franchise: { bg: 'bg-green-50', text: 'text-green-600' },
  operacional: { bg: 'bg-blue-50', text: 'text-blue-600' },
  expansao: { bg: 'bg-purple-50', text: 'text-purple-600' },
};
