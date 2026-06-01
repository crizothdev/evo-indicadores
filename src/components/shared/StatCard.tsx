import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
  children?: React.ReactNode;
}

export function StatCard({ label, value, className, children }: StatCardProps) {
  return (
    <Card className={cn('border-border', className)}>
      <CardContent style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {children && <div style={{ marginTop: 'auto' }}>{children}</div>}
      </CardContent>
    </Card>
  );
}