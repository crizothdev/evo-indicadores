import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface" style={{ paddingLeft: '24px', paddingRight: '10px' }}>
      <div className="flex items-center gap-4">
        {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
        <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Dados atualizados
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {user?.name?.charAt(0) ?? 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
