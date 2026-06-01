import { cn } from '@/lib/utils';

const levels = [
  { key: 'Critica', color: '#DC3545', label: 'Crítica' },
  { key: 'Estatica', color: '#6C757D', label: 'Estática' },
  { key: 'Atencao', color: '#FFC107', label: 'Atenção' },
  { key: 'Saudavel', color: '#28A745', label: 'Saudável' },
  { key: 'Destaque', color: '#FFC107', label: 'Destaque' },
] as const;

interface SituationScaleProps {
  current: string;
  className?: string;
}

export function SituationScale({ current, className }: SituationScaleProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {levels.map((lvl) => {
        const isActive = lvl.key === current;
        return isActive ? (
          <span
            key={lvl.key}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-white"
            style={{ backgroundColor: lvl.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {lvl.label}
          </span>
        ) : (
          <span
            key={lvl.key}
            className="h-1.5 w-1.5 rounded-full opacity-30"
            style={{ backgroundColor: lvl.color }}
          />
        );
      })}
    </div>
  );
}
