import { cn } from '@/lib/utils';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Destaque: { bg: '#F3E5F5', text: '#6A1B9A', label: 'Destaque' },
  Operacional: { bg: '#E8F5E9', text: '#2E7D32', label: 'Operacional' },
  Queda: { bg: '#FFF8E1', text: '#F57F17', label: 'Queda' },
  Atenção: { bg: '#FFF3E0', text: '#E65100', label: 'Atenção' },
  Crítico: { bg: '#FFEBEE', text: '#C62828', label: 'Crítico' },
  Saudavel: { bg: '#E8F5E9', text: '#2E7D32', label: 'Saudável' },
  Estatica: { bg: '#F5F5F5', text: '#616161', label: 'Estática' },
  Atencao: { bg: '#FFF3E0', text: '#E65100', label: 'Atenção' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { bg: '#F5F5F5', text: '#616161', label: status };
  return (
    <span className={cn('inline-flex items-center rounded-md text-xs font-semibold', className)} style={{ padding: '4px 10px', backgroundColor: config.bg, color: config.text }}>
      {config.label}
    </span>
  );
}