import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, ArrowRight } from 'lucide-react';

export default function AguardandoAprovacaoPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-0 left-0 right-0 h-72 bg-yellow-500" />
      <Card className="relative z-10 w-full max-w-md border-border shadow-lg text-center">
        <CardHeader className="pb-0">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold">Conta Pendente</h1>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Olá, <strong>{user?.name}</strong>! Sua conta foi criada e está aguardando aprovação de um administrador.
          </p>
          <p className="text-sm text-muted-foreground">
            Você receberá acesso ao sistema assim que sua conta for aprovada. Em caso de dúvidas, entre em contato com o administrador da plataforma.
          </p>
          <div className="rounded-lg bg-muted p-4 text-left text-sm space-y-1">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Status:</strong> <span className="text-yellow-600 font-semibold">Aguardando aprovação</span></p>
          </div>
          <Button variant="outline" className="gap-1.5" onClick={logout}>
            Sair <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
