export type Role = 'admin' | 'franchise' | 'operacional' | 'expansao';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitId?: string;
  active: boolean;
  approved: boolean;
}

export interface Unit {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  status: 'Destaque' | 'Operacional' | 'Queda' | 'Atenção' | 'Crítico';
  tces: number;
  growth: number;
  engagement: number;
  ranking: number;
  trend: 'up' | 'down' | 'stable';
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
  createdBy: string;
  target: string;
  targets?: string[];
}

export interface Appointment {
  id: string;
  unitId: string;
  unitName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'reuniao' | 'suporte' | 'checkin';
}

export interface Top5Entry {
  pos: number;
  name: string;
  growth: string;
  training: string;
  social: 'OK' | 'Pendente';
  payment: 'OK' | 'Pendente';
  status: 'Aprovada' | 'Pendente' | 'Rejeitada';
}

export interface FollowUp {
  id: string;
  unitName: string;
  priority: 'Alta' | 'Media' | 'Baixa';
  status: string;
  since: string;
  growth: string;
  lastAction: string;
  actions: number;
}

export interface EngagementDataPoint {
  month: string;
  value: number;
}
