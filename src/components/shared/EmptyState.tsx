import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 px-8 text-center', className)}>
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/40 mb-4" />}
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      {description && <p className="mt-1.5 text-xs text-muted-foreground/60 max-w-sm">{description}</p>}
    </div>
  );
}
