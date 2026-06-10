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
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Eye, Building2, Loader2 } from 'lucide-react';
import type { Role } from '@/types';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function calcStatus(diff: number): string {
  if (diff >= 10) return 'Destaque';
  if (diff >= 0) return 'Operacional';
  if (diff > -5) return 'Queda';
  if (diff > -10) return 'Atenção';
  return 'Crítico';
}

export default function UnidadeDetalhePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const { data: unit, isLoading, error } = useUnit(id ?? '');
  const [tceHistory, setTceHistory] = useState<{ date: string; totalTCE: number }[]>([]);
  const [periodFilter, setPeriodFilter] = useState('5d');

  useEffect(() => {
    if (!unit) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'tce_history'), where('razaoSocial', '==', unit.nomeFantasia)));
        const sorted = snap.docs.sort((a, b) => a.data().date.localeCompare(b.data().date));
        const data = sorted.map(d => ({ date: d.data().date as string, totalTCE: d.data().totalTCE as number }));
        setTceHistory(data);
      } catch {}
    })();
  }, [unit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!unit && error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Detalhe da Unidade">
          <Link to="/unidades"><Button variant="outline" size="sm">← Voltar</Button></Link>
        </PageHeader>
        <EmptyState icon={Building2} title="Erro ao carregar unidade" description="Não foi possível carregar os dados. Tente novamente." />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const dailyData = tceHistory.map(h => ({ date: h.date, value: h.totalTCE }));
  const monthlyAgg = tceHistory.length > 0
    ? Object.entries(
        tceHistory.reduce((acc: Record<string, number>, h) => {
          const key = h.date.slice(0, 7);
          acc[key] = (acc[key] ?? 0) + h.totalTCE;
          return acc;
        }, {})
      ).map(([month, value]) => ({ month: month.slice(5), value })).sort((a, b) => a.month.localeCompare(b.month))
    : [];

  function getCarryForward(target: string): number {
    const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));
    let last = 0;
    for (const entry of sorted) {
      if (entry.date > target) break;
      last = entry.value;
    }
    return last;
  }

  function generateDays(dates: string[]): any[] {
    return dates.map(d => ({ month: d.slice(5), value: getCarryForward(d), date: d }));
  }

  const todayUd = new Date();
  const curYearUd = todayUd.getFullYear();
  const curMonthUd = todayUd.getMonth() + 1;
  const evo3mColors = ['#3B82F6', '#8B5CF6', '#DC3545'];

  const historyData = dailyData.length > 0
    ? (() => {
        if (periodFilter === '5d') return dailyData.slice(-5).map(d => ({ month: d.date.slice(5), value: d.value }));
        if (periodFilter === '15d') {
          const dates: string[] = [];
          for (let i = 14; i >= 0; i--) {
            const d = new Date(todayUd);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().slice(0, 10));
          }
          return generateDays(dates);
        }
        if (periodFilter === 'month') {
          const lastDay = new Date(curYearUd, curMonthUd, 0).getDate();
          const dates: string[] = [];
          for (let d = 1; d <= lastDay; d += 2) {
            dates.push(`${curYearUd}-${String(curMonthUd).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
          }
          return generateDays(dates);
        }
        if (periodFilter === '3m') {
          const result: any[] = [];
          for (let i = 2; i >= 0; i--) {
            const d = new Date(curYearUd, curMonthUd - i - 1, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const lastDay = new Date(y, m, 0).getDate();
            const days = [1, 6, 12, 18, lastDay];
            for (const day of days) {
              const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              result.push({ month: dateStr.slice(5), value: getCarryForward(dateStr), color: evo3mColors[i] });
            }
          }
          return result;
        }
        const count = periodFilter === '5m' ? 5 : 12;
        return (monthlyAgg.length > 0 ? monthlyAgg : dailyData.map(d => ({ month: d.date.slice(5), value: d.value }))).slice(-count);
      })()
    : [];

  const metrics = [
    { label: 'TCEs Ativos', value: String(unit?.tces ?? 0), sub: '+8 este mês' },
    { label: 'Crescimento', value: `${(unit?.growth ?? 0) >= 0 ? '+' : ''}${unit?.growth ?? 0}`, sub: '' },
    { label: 'Engajamento', value: `${unit?.engagement ?? 0}%`, sub: 'Presença treinamentos' },
    { label: 'Posição Ranking', value: `#${unit?.ranking ?? 0}`, sub: 'de 156 unidades' },
  ];

  const statusMap: Record<string, string> = {
    Destaque: 'Saudavel',
    Operacional: 'Saudavel',
    Queda: 'Atencao',
    Atenção: 'Atencao',
    Crítico: 'Critica',
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
                <StatusBadge status={calcStatus(unit.growth)} />
                <span className="text-sm text-primary font-medium">Ranking #{unit.ranking}</span>
              </div>
            </div>
            <SituationScale current={statusMap[calcStatus(unit.growth)] ?? 'Saudavel'} />
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Histórico Rápido</CardTitle>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[['5d', '5d'], ['15d', '15d'], ['month', 'Mês'], ['3m', '3m'], ['5m', '5m'], ['12m', '12m']].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setPeriodFilter(val)}
                    style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: periodFilter === val ? '#DC3545' : '#eee', color: periodFilter === val ? '#fff' : '#666' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={historyData}>
                <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(label: any) => {
                  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                  if (label.includes('-')) {
                    const [m, d] = label.split('-');
                    return `${parseInt(d, 10)}/${meses[parseInt(m, 10) - 1]}`;
                  }
                  return meses[parseInt(label, 10) - 1] || label;
                }} />
                <Tooltip formatter={(value: any) => [`${value} TCEs`, '']} labelFormatter={(label: any) => {
                  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                  if (label.includes('-')) {
                    const [m, d] = label.split('-');
                    return `${parseInt(d, 10)}/${meses[parseInt(m, 10) - 1]}`;
                  }
                  return meses[parseInt(label, 10) - 1] || label;
                }} contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: '6px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" stroke="#DC3545" strokeWidth={2} dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (cx == null || cy == null) return null;
                  return <circle cx={cx} cy={cy} r={4} fill={payload?.color || '#DC3545'} stroke="#fff" strokeWidth={1} />;
                }} />
              </LineChart>
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
