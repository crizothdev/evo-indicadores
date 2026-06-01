import { cn } from '@/lib/utils';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Operacional: { bg: 'bg-green-50', text: 'text-green-600', label: 'Operacional' },
  Critica: { bg: 'bg-red-50', text: 'text-red-600', label: 'Crítica' },
  'Em Acompanhamento': { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Em Acompanhamento' },
  Saudavel: { bg: 'bg-green-50', text: 'text-green-600', label: 'Saudável' },
  Estatica: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Estática' },
  Atencao: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Atenção' },
  Destaque: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Destaque' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { bg: 'bg-gray-50', text: 'text-gray-600', label: status };
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', config.bg, config.text, className)}>
      {config.label}
    </span>
  );
}
