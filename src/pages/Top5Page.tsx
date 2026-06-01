import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { useTop5, useUpdateTop5 } from '@/hooks/useTop5';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, CheckCircle, XCircle, Loader2, Award } from 'lucide-react';
import type { Role, Top5Entry } from '@/types';

const statusColors: Record<string, { bg: string; text: string }> = {
  Aprovada: { bg: 'bg-green-50', text: 'text-green-600' },
  Pendente: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  Rejeitada: { bg: 'bg-red-50', text: 'text-red-600' },
};

const checkColors: Record<string, string> = {
  OK: 'text-green-600',
  Pendente: 'text-yellow-600',
};

export default function Top5Page() {
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const canAudit = hasPermission(role, 'canAuditTop5');
  const { data: entries = [], isLoading, error } = useTop5();
  const updateTop5 = useUpdateTop5();

  const handleApprove = (id: string) => {
    updateTop5.mutate({ id, data: { status: 'Aprovada' } });
  };

  const handleReject = (id: string) => {
    updateTop5.mutate({ id, data: { status: 'Rejeitada' } });
  };

  const pendingCount = entries.filter((e) => e.status === 'Pendente').length;
  const approvedCount = entries.filter((e) => e.status === 'Aprovada').length;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Ranking TOP 5" description="Premiação mensal das melhores unidades" />
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Ranking TOP 5" description="Premiação mensal das melhores unidades">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 border-yellow-200 bg-yellow-50 text-yellow-700 px-3 py-1.5 text-sm font-semibold">
            {pendingCount} Pendente{pendingCount !== 1 ? 's' : ''}
          </Badge>
          {approvedCount > 0 && (
            <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-600 px-3 py-1.5 text-sm font-semibold">
              {approvedCount} Aprovada{approvedCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </PageHeader>

      {error ? (
        <EmptyState icon={Trophy} title="Erro ao carregar TOP 5" description="Não foi possível carregar os dados. Tente novamente." />
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="Nenhum dado do TOP 5 disponível" description="Os dados do ranking serão exibidos aqui após a importação e processamento." />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Award className="h-4 w-4 text-yellow-500" /> Ranking do Mês</CardTitle>
                <span className="text-xs text-muted-foreground">{entries.length} candidatos</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Crescimento</TableHead>
                    <TableHead className="text-center">Treinamentos</TableHead>
                    <TableHead className="text-center">Redes Sociais</TableHead>
                    <TableHead className="text-center">Pagamento</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    {canAudit && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries
                    .sort((a, b) => a.pos - b.pos)
                    .map((entry) => (
                      <TableRow key={(entry as any).id ?? entry.name}>
                        <TableCell>
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${entry.pos <= 3 ? (entry.pos === 1 ? 'bg-yellow-500' : entry.pos === 2 ? 'bg-gray-400' : 'bg-amber-700') : 'bg-muted-foreground/30 text-muted-foreground'}`}>
                            {entry.pos}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell className={`text-right font-semibold ${entry.growth.startsWith('+') || !entry.growth.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>{entry.growth}</TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-semibold ${checkColors[entry.training] ?? 'text-muted-foreground'}`}>{entry.training}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-semibold ${checkColors[entry.social] ?? 'text-muted-foreground'}`}>{entry.social}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-semibold ${checkColors[entry.payment] ?? 'text-muted-foreground'}`}>{entry.payment}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[entry.status]?.bg ?? 'bg-gray-50'} ${statusColors[entry.status]?.text ?? 'text-gray-600'}`}>
                            {entry.status === 'Aprovada' ? <CheckCircle className="h-3 w-3" /> : entry.status === 'Rejeitada' ? <XCircle className="h-3 w-3" /> : null}
                            {entry.status}
                          </span>
                        </TableCell>
                        {canAudit && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {entry.status !== 'Aprovada' && (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove((entry as any).id)} disabled={updateTop5.isPending}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {entry.status !== 'Rejeitada' && (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject((entry as any).id)} disabled={updateTop5.isPending}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Histórico TOP 5</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <EmptyState className="border-none bg-transparent py-8" title="Nenhum histórico disponível" description="O histórico de premiações aparecerá aqui quando houver dados." />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
