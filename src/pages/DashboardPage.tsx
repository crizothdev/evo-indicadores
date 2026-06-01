import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { useUnits } from '@/hooks/useUnits';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Users, Eye, Building2, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import type { Role } from '@/types';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const currentMonthIndex = new Date().getMonth();

export default function DashboardPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const { data: units = [], isLoading, error } = useUnits();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Dashboard Geral" description="Visão geral da rede de franquias" />
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Dashboard Geral" description="Visão geral da rede de franquias" />
        <EmptyState icon={Building2} title="Erro ao carregar dados" description="Não foi possível carregar os dados do dashboard. Tente novamente." />
      </div>
    );
  }

  const totalTCEs = units.reduce((s, u) => s + u.tces, 0);
  const avgGrowth = units.length > 0 ? units.reduce((s, u) => s + u.growth, 0) / units.length : 0;
  const avgEngagement = units.length > 0 ? units.reduce((s, u) => s + u.engagement, 0) / units.length : 0;
  const saudaveis = units.filter((u) => u.status === 'Operacional').length;
  const acompanhamento = units.filter((u) => u.status === 'Em Acompanhamento').length;
  const criticas = units.filter((u) => u.status === 'Critica').length;

  const evolutionData = months.map((month, i) => ({
    month,
    crescimento: Math.round(totalTCEs * (0.3 + (i + 1) / 12) * (1 + (Math.random() - 0.5) * 0.05)),
  }));

  const sortedByGrowth = [...units].sort((a, b) => b.growth - a.growth).slice(0, 5);
  const topRanking = [...units].sort((a, b) => a.ranking - b.ranking).slice(0, 5);

  const situationData = [
    { name: 'Saudável', value: saudaveis, color: '#28A745' },
    { name: 'Acompanhamento', value: acompanhamento, color: '#FFC107' },
    { name: 'Crítica', value: criticas, color: '#DC3545' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard Geral" description="Visão geral da rede de franquias">
        {hasPermission(role, 'canImport') && (
          <Link to="/importacao">
            <Button size="sm" className="gap-1.5" style={{ padding: '8px 16px', background: '#DC3545', color: '#fff' }}>
              <Upload className="h-4 w-4" /> Importar Dados
            </Button>
          </Link>
        )}
      </PageHeader>

      <div className="grid grid-cols-5 gap-3.5">
        <StatCard label="Total de TCEs" value={totalTCEs.toLocaleString()}>
          <div className="flex items-center gap-1">
            {months.map((m, i) => {
              const isFuture = i > currentMonthIndex;
              return <div key={m} className="h-2 w-2 rounded-full" style={{ backgroundColor: isFuture ? '#D0D0D0' : '#FFCCCC' }} />;
            })}
          </div>
        </StatCard>
        <StatCard label="Crescimento da Rede" value={`${avgGrowth >= 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`}>
          <div className="flex items-center gap-1">
            {months.map((m, i) => {
              const isFuture = i > currentMonthIndex;
              return <div key={m} className="h-2 w-2 rounded-full" style={{ backgroundColor: isFuture ? '#D0D0D0' : '#FFCCCC' }} />;
            })}
          </div>
        </StatCard>
        <StatCard label="Unidades Ativas" value={String(units.length)}>
          <div className="flex gap-1.5 mt-1">
            {saudaveis > 0 && <div className="flex-1 h-1.5 rounded-full bg-green-500" style={{ width: `${(saudaveis / units.length) * 100}%` }} />}
            {acompanhamento > 0 && <div className="h-1.5 rounded-full bg-yellow-500" style={{ width: `${(acompanhamento / units.length) * 100}%` }} />}
            {criticas > 0 && <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${(criticas / units.length) * 100}%` }} />}
          </div>
          <div className="flex gap-3 mt-1 text-[10px]">
            {saudaveis > 0 && <span className="text-green-600 font-semibold">{saudaveis} Saudável</span>}
            {acompanhamento > 0 && <span className="text-yellow-600 font-semibold">{acompanhamento} Acomp.</span>}
            {criticas > 0 && <span className="text-red-600 font-semibold">{criticas} Crítica</span>}
          </div>
        </StatCard>
        <StatCard label="Engajamento Médio" value={`${avgEngagement.toFixed(1)}%`}>
          <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${avgEngagement}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Presença em treinamentos</p>
        </StatCard>
        <StatCard label="Acompanhamento" value="Em breve" />
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Evolução da Rede</CardTitle>
              <div className="flex gap-1 rounded-md bg-muted p-0.5">
                {['6M', '1A', '2A'].map((t, i) => (
                  <button key={t} className={`px-2.5 py-1 text-xs rounded font-medium ${i === 1 ? 'bg-primary text-white' : 'text-muted-foreground'}`}>{t}</button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={evolutionData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Bar dataKey="crescimento" radius={[3, 3, 0, 0]}>
                  {evolutionData.map((entry, index) => (
                    <Cell key={index} fill={entry.crescimento > 800 ? '#28A745' : entry.crescimento > 600 ? '#007BFF' : entry.crescimento > 400 ? '#FFC107' : '#DC3545'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3.5 mt-1">
              {[{ c: '#28A745', l: 'Excelente' }, { c: '#007BFF', l: 'Bom' }, { c: '#FFC107', l: 'Regular' }, { c: '#DC3545', l: 'Baixo' }].map((x) => (
                <div key={x.l} className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><div className="h-1 w-2.5 rounded-sm" style={{ backgroundColor: x.c }} />{x.l}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Ranking de Crescimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {sortedByGrowth.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum dado disponível</p>
            ) : (
              sortedByGrowth.map((r, i) => {
                const colors = ['#FFC107', '#ADB5BD', '#CD7F32', '#6C757D', '#6C757D'];
                return (
                  <div key={r.id} className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: colors[i] ?? '#6C757D' }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{r.nomeFantasia}</p>
                      <div className="h-0.5 w-full rounded-full bg-muted mt-0.5">
                        <div className="h-0.5 rounded-full bg-primary" style={{ width: `${(sortedByGrowth.length - i) * 20}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${r.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.growth >= 0 ? '+' : ''}{r.growth}%</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Unidades - Visão Operacional</CardTitle>
              {hasPermission(role, 'canViewAllUnits') && (
                <Link to="/unidades"><Button variant="link" size="sm" className="text-primary h-auto p-0">Ver todas →</Button></Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {units.length === 0 ? (
              <EmptyState className="border-none bg-transparent py-8" icon={Building2} title="Nenhuma unidade cadastrada" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>TCEs</TableHead>
                      <TableHead>Cresc.</TableHead>
                      <TableHead>Engaj.</TableHead>
                      <TableHead>Rank</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRanking.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-sm">{u.nomeFantasia}</TableCell>
                        <TableCell><StatusBadge status={u.status} /></TableCell>
                        <TableCell className="font-semibold">{u.tces}</TableCell>
                        <TableCell className={`font-semibold text-sm ${u.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{u.growth >= 0 ? '+' : ''}{u.growth}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{u.engagement}%</span>
                            <div className="h-1 w-10 rounded-full bg-muted">
                              <div className="h-1 rounded-full bg-green-500" style={{ width: `${u.engagement}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={`font-bold text-sm ${u.ranking === 1 ? 'text-yellow-600' : 'text-muted-foreground'}`}>#{u.ranking}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Mostrando {topRanking.length} de {units.length} unidades</p>
                  <div className="flex gap-2">
                    {hasPermission(role, 'canImport') && (
                      <Link to="/importacao"><Button size="sm" variant="default" className="gap-1.5 h-8 text-xs"><Upload className="h-3 w-3" /> Importar Dados</Button></Link>
                    )}
                    {hasPermission(role, 'canViewAllUnits') && (
                      <Link to="/unidades"><Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><Eye className="h-3 w-3" /> Ver Todas</Button></Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Distribuição de Situações</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {situationData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            ) : (
              <div className="space-y-3 pt-2">
                {situationData.map((d) => (
                  <div key={d.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full" style={{ width: `${(d.value / units.length) * 100}%`, backgroundColor: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
