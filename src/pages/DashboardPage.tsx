import { useState, useEffect } from 'react';
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
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Role } from '@/types';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const currentMonthIndex = new Date().getMonth();

export default function DashboardPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const { data: units = [], isLoading, error } = useUnits();
  const [totalHistory, setTotalHistory] = useState<{ month: string; total: number }[]>([]);
  const [dailyHistory, setDailyHistory] = useState<{ date: string; total: number }[]>([]);
  const [unitMonthly, setUnitMonthly] = useState<Record<string, Record<string, number>>>({});
  const [evoPeriod, setEvoPeriod] = useState('6');
  const [rankMonth, setRankMonth] = useState(currentMonthIndex);
  const [chartMetric, setChartMetric] = useState('tces');
  const [engagementHistory, setEngagementHistory] = useState<{ month: string; total: number; max: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'tce_history'));
        const sorted = snap.docs.sort((a, b) => a.data().date.localeCompare(b.data().date));
        const byMonth: Record<string, Record<string, number>> = {};
        const byDay: Record<string, Record<string, number>> = {};
        const byUnit: Record<string, Record<string, number>> = {};
        sorted.forEach(d => {
          const date = d.data().date as string;
          const monthKey = date.slice(0, 7);
          const unit = d.data().razaoSocial as string;
          const tces = d.data().totalTCE as number;
          if (!byMonth[monthKey]) byMonth[monthKey] = {};
          byMonth[monthKey][unit] = tces;
          if (!byDay[date]) byDay[date] = {};
          byDay[date][unit] = tces;
          if (!byUnit[unit]) byUnit[unit] = {};
          byUnit[unit][monthKey] = tces;
        });
        const monthData = Object.entries(byMonth).map(([month, units]) => ({
          month: month.slice(5),
          total: Object.values(units).reduce((s, v) => s + v, 0),
        })).sort((a, b) => a.month.localeCompare(b.month));
        const dayData = Object.entries(byDay).map(([date, units]) => ({
          date,
          total: Object.values(units).reduce((s, v) => s + v, 0),
        })).sort((a, b) => a.date.localeCompare(b.date));
        setTotalHistory(monthData);
        setDailyHistory(dayData);
        setUnitMonthly(byUnit);
      } catch {}
    })();
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'training_presence'));
        const byUnitMonth: Record<string, Record<string, { attended: number; total: number }>> = {};
        snap.docs.forEach(d => {
          const mKey = (d.data().trainingDate as string).slice(0, 7);
          const unit = d.data().unitName as string;
          const present = d.data().present as boolean;
          if (!byUnitMonth[unit]) byUnitMonth[unit] = {};
          if (!byUnitMonth[unit][mKey]) byUnitMonth[unit][mKey] = { attended: 0, total: 0 };
          byUnitMonth[unit][mKey].total++;
          if (present) byUnitMonth[unit][mKey].attended++;
        });
        const monthKeys = new Set<string>();
        Object.values(byUnitMonth).forEach(u => Object.keys(u).forEach(m => monthKeys.add(m)));
        const data = Array.from(monthKeys).map(month => {
          const vals = Object.values(byUnitMonth).map(u => u[month]).filter(Boolean);
          const avg = vals.length > 0 ? Math.round(vals.reduce((s, v) => s + (v.attended / v.total) * 100, 0) / vals.length) : 0;
          return { month: month.slice(5), total: avg, max: 100 };
        }).sort((a, b) => a.month.localeCompare(b.month));
        setEngagementHistory(data);
      } catch {}
    })();
  }, []);

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
  const destaque = units.filter((u) => u.status === 'Destaque').length;
  const saudaveis = units.filter((u) => u.status === 'Operacional').length;
  const queda = units.filter((u) => u.status === 'Queda').length;
  const atencao = units.filter((u) => u.status === 'Atenção').length;
  const critico = units.filter((u) => u.status === 'Crítico').length;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  function getCarryForward(target: string, source: { date: string; total: number }[]): number {
    const sorted = [...source].sort((a, b) => a.date.localeCompare(b.date));
    let last = 0;
    for (const entry of sorted) {
      if (entry.date > target) break;
      last = entry.total;
    }
    return last;
  }

  function generateDays(dates: string[]): any[] {
    return dates.map(d => ({ date: d, total: getCarryForward(d, dailyHistory) }));
  }

  function generateMonthDays(year: number, month: number, step: number): string[] {
    const lastDay = new Date(year, month, 0).getDate();
    const days: string[] = [];
    for (let d = 1; d <= lastDay; d += step) {
      days.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return days;
  }

  const evo3mColors = ['#3B82F6', '#8B5CF6', '#DC3545'];

  function formatDateLabel(label: string): string {
    if (label.includes('-')) {
      const parts = label.split('-');
      if (parts.length === 3) {
        return `${parseInt(parts[2], 10)}/${meses[parseInt(parts[1], 10) - 1]}`;
      }
      return `${parseInt(parts[1], 10)}/${meses[parseInt(parts[0], 10) - 1]}`;
    }
    return meses[parseInt(label, 10) - 1] || label;
  }

  const today = new Date();
  const curYear = today.getFullYear();
  const curMonth = today.getMonth() + 1;

  const evoData: any[] = chartMetric === 'tces'
    ? (() => {
        if (evoPeriod === '5d' && dailyHistory.length >= 3) {
          return dailyHistory.slice(-5);
        }
        if (evoPeriod === '15d' && dailyHistory.length > 0) {
          const dates: string[] = [];
          for (let i = 14; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().slice(0, 10));
          }
          return generateDays(dates);
        }
        if (evoPeriod === '1m' && dailyHistory.length > 0) {
          return generateDays(generateMonthDays(curYear, curMonth, 2));
        }
        if (evoPeriod === '3m' && dailyHistory.length > 0) {
          const result: any[] = [];
          for (let i = 2; i >= 0; i--) {
            const d = new Date(curYear, curMonth - i - 1, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const lastDay = new Date(y, m, 0).getDate();
            const days = [1, 6, 12, 18, lastDay];
            for (const day of days) {
              const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              result.push({ date: dateStr, total: getCarryForward(dateStr, dailyHistory), color: evo3mColors[i] });
            }
          }
          return result;
        }
        const monthCounts: Record<string, number> = { '5d': 1, '15d': 1, '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
        const count = monthCounts[evoPeriod] ?? 12;
        const data = totalHistory.slice(-count);
        while (data.length < count) data.unshift({ month: '—', total: 0 });
        return data;
      })()
    : (() => {
        const monthCounts: Record<string, number> = { '5d': 1, '15d': 1, '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
        const count = monthCounts[evoPeriod] ?? 12;
        const data = engagementHistory.slice(-count);
        while (data.length < count) data.unshift({ month: '—', total: 0, max: 100 });
        return data;
      })();

  const year = new Date().getFullYear();
  const rankMonthKey = `${year}-${String(rankMonth + 1).padStart(2, '0')}`;
  const prevMonthKey = `${year}-${String(rankMonth).padStart(2, '0')}`;
  const rankGrowth: { unit: string; growth: number; tces: number }[] = [];
  for (const [unit, months] of Object.entries(unitMonthly)) {
    const curr = months[rankMonthKey] ?? 0;
    const prev = months[prevMonthKey] ?? 0;
    if (curr > 0 || prev > 0) {
      rankGrowth.push({ unit, growth: curr - prev, tces: curr });
    }
  }
  rankGrowth.sort((a, b) => b.growth - a.growth);
  const top5 = rankGrowth.slice(0, 5);
  const topRanking = [...units].sort((a, b) => a.ranking - b.ranking).slice(0, 5);

  const situationData = [
    { name: 'Destaque', value: destaque, color: '#8B5CF6' },
    { name: 'Saudável', value: saudaveis, color: '#28A745' },
    { name: 'Queda', value: queda, color: '#FFC107' },
    { name: 'Atenção', value: atencao, color: '#F97316' },
    { name: 'Crítico', value: critico, color: '#DC3545' },
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
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '35px', gap: '3px' }}>
            {months.map((m, i) => {
              const isFuture = i > currentMonthIndex;
              if (isFuture) return <div key={m} style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, backgroundColor: '#D0D0D0' }} />;
              const data = totalHistory.length > 0 ? totalHistory.find(h => h.month === String(i + 1).padStart(2, '0')) : null;
              if (!data) return <div key={m} style={{ width: '16px', borderRadius: '3px', height: '6px', backgroundColor: '#FFCCCC' }} />;
              const max = Math.max(...totalHistory.map(h => h.total));
              return <div key={m} style={{ width: '16px', borderRadius: '3px', height: `${(data.total / max) * 100}%`, backgroundColor: '#DC3545', opacity: 0.7 }} />;
            })}
          </div>
        </StatCard>
        <StatCard label="Crescimento da Rede" value={`${avgGrowth >= 0 ? '+' : ''}${avgGrowth}`}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '35px', gap: '3px' }}>
            {months.map((m, i) => {
              const isFuture = i > currentMonthIndex;
              if (isFuture) return <div key={m} style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, backgroundColor: '#D0D0D0' }} />;
              const data = totalHistory.length > 0 ? totalHistory.find(h => h.month === String(i + 1).padStart(2, '0')) : null;
              if (!data) return <div key={m} style={{ width: '16px', borderRadius: '3px', height: '6px', backgroundColor: '#FFCCCC' }} />;
              const prev = totalHistory.find(h => h.month === String(i).padStart(2, '0'));
              const max = Math.max(...totalHistory.map(h => h.total));
              const color = prev ? (data.total >= prev.total ? '#28A745' : '#DC3545') : '#007BFF';
              return <div key={m} style={{ width: '16px', borderRadius: '3px', height: `${(data.total / max) * 100}%`, backgroundColor: color, opacity: 0.8 }} />;
            })}
          </div>
        </StatCard>
        <StatCard label="Unidades Ativas" value={String(units.length)}>
          <div className="flex gap-1.5 mt-1">
            {saudaveis > 0 && <div className="flex-1 h-1.5 rounded-full bg-green-500" style={{ width: `${(saudaveis / units.length) * 100}%` }} />}
            {destaque > 0 && <div className="flex-1 h-1.5 rounded-full bg-purple-500" style={{ width: `${(destaque / units.length) * 100}%` }} />}
            {queda > 0 && <div className="flex-1 h-1.5 rounded-full bg-yellow-500" style={{ width: `${(queda / units.length) * 100}%` }} />}
            {atencao > 0 && <div className="h-1.5 rounded-full bg-orange-500" style={{ width: `${(atencao / units.length) * 100}%` }} />}
            {critico > 0 && <div className="h-1.5 rounded-full bg-red-500" style={{ width: `${(critico / units.length) * 100}%` }} />}
          </div>
          <div className="flex gap-3 mt-1 text-[10px]">
            {destaque > 0 && <span className="text-purple-600 font-semibold">{destaque} Destaque</span>}
            {saudaveis > 0 && <span className="text-green-600 font-semibold">{saudaveis} Saudável</span>}
            {queda > 0 && <span className="text-yellow-600 font-semibold">{queda} Queda</span>}
            {atencao > 0 && <span className="text-orange-600 font-semibold">{atencao} Atenção</span>}
            {critico > 0 && <span className="text-red-600 font-semibold">{critico} Crítico</span>}
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
              <CardTitle className="text-sm font-semibold">
                <select value={chartMetric} onChange={e => setChartMetric(e.target.value)} style={{ border: 'none', background: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                  <option value="tces">Evolução da Rede</option>
                  <option value="engagement">Engajamento da Rede</option>
                </select>
              </CardTitle>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[['5d', '5d'], ['15d', '15d'], ['1m', '1m'], ['3m', '3m'], ['6m', '6m'], ['12m', '12m']].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setEvoPeriod(val)}
                    style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: evoPeriod === val ? '#DC3545' : '#eee', color: evoPeriod === val ? '#fff' : '#666' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={evoData}>
                <XAxis dataKey={evoData.length > 0 && 'date' in evoData[0] ? 'date' : 'month'} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(label: any) => formatDateLabel(label)} />
                <Tooltip formatter={(value: any) => [`${value}${chartMetric === 'engagement' ? '%' : ' TCEs'}`, chartMetric === 'engagement' ? 'Engajamento' : 'Total']} labelFormatter={(label: any) => formatDateLabel(label)} contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: '6px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="total" stroke="#DC3545" strokeWidth={2} dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (cx == null || cy == null) return null;
                  return <circle cx={cx} cy={cy} r={4} fill={payload?.color || '#DC3545'} stroke="#fff" strokeWidth={1} />;
                }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">TOP 5</CardTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button type="button" onClick={() => setRankMonth(Math.max(0, rankMonth - 1))} style={{ padding: '2px 6px', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: '#eee', color: '#666' }}>‹</button>
                <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '36px', textAlign: 'center' }}>{months[rankMonth].toLowerCase()}</span>
                <button type="button" onClick={() => setRankMonth(Math.min(11, rankMonth + 1))} style={{ padding: '2px 6px', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: '#eee', color: '#666' }}>›</button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {top5.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum dado disponível</p>
            ) : (
              top5.map((r, i) => {
                const unitData = units.find(u => u.nomeFantasia === r.unit);
                const colors = ['#FFC107', '#ADB5BD', '#CD7F32', '#6C757D', '#6C757D'];
                return (
                  <div key={r.unit} className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: colors[i] ?? '#6C757D' }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{unitData?.nomeFantasia ?? r.unit}</p>
                      <div className="h-0.5 w-full rounded-full bg-muted mt-0.5">
                        <div className="h-0.5 rounded-full bg-primary" style={{ width: `${(top5.length - i) * 20}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${r.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.growth >= 0 ? '+' : ''}{r.growth}</span>
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
                        <TableCell className={`font-semibold text-sm ${u.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{u.growth >= 0 ? '+' : ''}{u.growth}</TableCell>
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
