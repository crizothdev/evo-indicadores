import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { useUnit } from '@/hooks/useUnits';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SituationScale } from '@/components/shared/SituationScale';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Eye, Building2, Loader2 } from 'lucide-react';
import type { Role } from '@/types';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function UnidadeDetalhePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const { data: unit, isLoading, error } = useUnit(id ?? '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="space-y-5">
        <PageHeader title="Detalhe da Unidade">
          <Link to="/unidades"><Button variant="outline" size="sm">← Voltar</Button></Link>
        </PageHeader>
        <EmptyState icon={Building2} title={error ? 'Erro ao carregar unidade' : 'Unidade não encontrada'} description={error ? 'Não foi possível carregar os dados. Tente novamente.' : 'A unidade solicitada não existe ou foi removida.'} />
      </div>
    );
  }

  const historyData = months.map((month, i) => ({
    month,
    value: Math.round(unit.tces * (0.5 + (i + 1) / 12) * (1 + (Math.random() - 0.5) * 0.1)),
  }));

  const metrics = [
    { label: 'TCEs Ativos', value: String(unit.tces), sub: '+8 este mês' },
    { label: 'Crescimento', value: `${unit.growth >= 0 ? '+' : ''}${unit.growth}%`, sub: 'Meta: +25%' },
    { label: 'Engajamento', value: `${unit.engagement}%`, sub: 'Presença treinamentos' },
    { label: 'Posição Ranking', value: `#${unit.ranking}`, sub: 'de 156 unidades' },
  ];

  const statusMap: Record<string, string> = {
    Operacional: 'Saudavel',
    Critica: 'Atencao',
    'Em Acompanhamento': 'Atencao',
  };

  return (
    <div className="space-y-5">
      <PageHeader title={unit.nomeFantasia}>
        <Link to="/unidades"><Button variant="outline" size="sm">← Voltar</Button></Link>
        {hasPermission(role, 'canManageFollowUp') && (
          <Button size="sm" className="gap-1.5"><Eye className="h-4 w-4" /> Acompanhar</Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-3 gap-3.5">
        <div className="col-span-2 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
              {getInitials(unit.nomeFantasia)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{unit.nomeFantasia}</h1>
              <p className="text-sm text-muted-foreground">{unit.razaoSocial}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={unit.status === 'Operacional' ? 'Saudavel' : unit.status} />
                <span className="text-sm text-primary font-medium">Ranking #{unit.ranking}</span>
              </div>
            </div>
            <SituationScale current={statusMap[unit.status] ?? 'Saudavel'} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m) => (
              <Card key={m.label}>
                <CardContent className="p-3.5 space-y-1">
                  <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  <p className="text-xl font-bold">{m.value}</p>
                  <p className="text-[11px] text-muted-foreground">{m.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Histórico Rápido</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={historyData}>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[2,2,0,0]}>
                  {historyData.map((d, i) => (
                    <Cell key={i} fill={d.value > unit.tces * 0.8 ? '#28A745' : d.value >= unit.tces * 0.5 ? '#FFC107' : '#DC3545'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-2 mt-1 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-1 w-2 rounded-sm bg-green-500" />Bom</span>
              <span className="flex items-center gap-1"><span className="h-1 w-2 rounded-sm bg-yellow-500" />Regular</span>
              <span className="flex items-center gap-1"><span className="h-1 w-2 rounded-sm bg-red-500" />Baixo</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <Card className="col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Customer Success</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <EmptyState className="border-none bg-transparent py-8" icon={Building2} title="Nenhum registro de CS" description="O histórico de acompanhamento aparecerá aqui." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Score de Saúde</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">{unit.engagement}</p>
              <p className="text-sm font-semibold text-green-600">{unit.engagement >= 80 ? 'Excelente' : unit.engagement >= 60 ? 'Bom' : 'Atenção'}</p>
            </div>
            {[
              { label: 'Crescimento', val: Math.min(100, Math.round(unit.growth * 2 + 50)) },
              { label: 'Engajamento', val: unit.engagement },
              { label: 'TCEs', val: Math.min(100, Math.round(unit.tces / 2)) },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{s.label}</span><span className="font-semibold">{s.val}/100</span></div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className="h-1.5 rounded-full" style={{ width: `${s.val}%`, backgroundColor: s.val >= 80 ? '#28A745' : s.val >= 50 ? '#FFC107' : '#DC3545' }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
