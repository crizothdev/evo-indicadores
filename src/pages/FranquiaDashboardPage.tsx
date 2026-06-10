import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnit, useUnits } from '@/hooks/useUnits';
import { useTop5 } from '@/hooks/useTop5';
import { useNotices } from '@/hooks/useNotices';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { SituationScale } from '@/components/shared/SituationScale';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Building2, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Role } from '@/types';

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

const statusMap: Record<string, string> = {
  Destaque: 'Saudavel',
  Operacional: 'Saudavel',
  Queda: 'Atencao',
  Atenção: 'Atencao',
  Crítico: 'Critica',
};

export default function FranquiaDashboardPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'franchise') as Role;
  const { data: unit, isLoading, error } = useUnit(user?.unitId ?? '');
  const { data: allUnits = [] } = useUnits();
  const { data: top5Entries = [] } = useTop5();
  const { data: notices = [] } = useNotices();
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

  const filteredNotices = notices.filter(n => n.target === 'all' || (n.target || '').split(',').includes(unit?.nomeFantasia ?? ''));
  const sortedByTces = [...allUnits].sort((a, b) => b.tces - a.tces);
  const approvedTop5 = top5Entries.filter(e => e.status === 'Aprovada').sort((a, b) => a.pos - b.pos);
  const colors = ['#FFC107', '#9E9E9E', '#CD7F32', '#6C757D', '#6C757D'];

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!unit && error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Minha Franquia" />
        <EmptyState icon={Building2} title="Erro ao carregar" description="Não foi possível carregar os dados da sua franquia." />
      </div>
    );
  }

  if (!unit) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const periodMap: Record<string, number> = { '5d': 5, '15d': 15, 'month': 30, '3m': 3, '5m': 5, '12m': 12 };
  const isDaily = periodFilter === '5d' || periodFilter === '15d' || periodFilter === 'month';
  const dailyData = tceHistory.map(h => ({ month: h.date.slice(5), value: h.totalTCE }));
  const monthlyAgg = tceHistory.length > 0
    ? Object.entries(tceHistory.reduce((acc: Record<string, number>, h) => {
        const key = h.date.slice(0, 7);
        acc[key] = h.totalTCE;
        return acc;
      }, {})).map(([month, value]) => ({ month: month.slice(5), value })).sort((a, b) => a.month.localeCompare(b.month))
    : [];
  const historyData = isDaily
    ? dailyData.slice(-periodMap[periodFilter])
    : (monthlyAgg.length > 0 ? monthlyAgg : dailyData).slice(-periodMap[periodFilter]);

  const metrics = [
    { label: 'TCEs Ativos', value: String(unit.tces), sub: '+8 este mês' },
    { label: 'Crescimento', value: `${unit.growth >= 0 ? '+' : ''}${unit.growth} TCEs`, sub: '' },
    { label: 'Engajamento', value: `${unit.engagement}%`, sub: 'Presença treinamentos' },
    { label: 'Posição Ranking', value: `#${unit.ranking}`, sub: 'de 156 unidades' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title={unit.nomeFantasia}>
        <div className="flex items-center gap-3">
          <SituationScale current={statusMap[calcStatus(unit.growth)] ?? 'Saudavel'} />
          <StatusBadge status={calcStatus(unit.growth)} />
        </div>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m) => (
              <Card key={m.label}>
                <CardContent style={{ padding: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#888' }}>{m.label}</p>
                  <p style={{ fontSize: '20px', fontWeight: 700 }}>{m.value}</p>
                  <p style={{ fontSize: '11px', color: '#888' }}>{m.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle style={{ fontSize: '13px', fontWeight: 600 }}>Histórico Rápido</CardTitle>
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
                <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => [`${value} TCEs`, '']} labelFormatter={(label: string) => `${label}`} contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: '6px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" stroke="#DC3545" strokeWidth={2} dot={{ r: 3, fill: '#DC3545' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <Card className="col-span-2">
          <CardHeader className="pb-2"><CardTitle style={{ fontSize: '13px', fontWeight: 600 }}>Customer Success</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <EmptyState className="border-none bg-transparent py-8" icon={Building2} title="Nenhum registro de CS" description="O histórico de acompanhamento aparecerá aqui." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle style={{ fontSize: '13px', fontWeight: 600 }}>Score de Saúde</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="text-center">
              <p style={{ fontSize: '32px', fontWeight: 700, color: '#28A745' }}>{unit.engagement}</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#2E7D32' }}>{unit.engagement >= 80 ? 'Excelente' : unit.engagement >= 60 ? 'Bom' : 'Atenção'}</p>
            </div>
            {[
              { label: 'Crescimento', val: Math.min(100, Math.round(unit.growth * 2 + 50)) },
              { label: 'Engajamento', val: unit.engagement },
              { label: 'TCEs', val: Math.min(100, Math.round(unit.tces / 2)) },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}><span style={{ color: '#888' }}>{s.label}</span><span style={{ fontWeight: 600 }}>{s.val}/100</span></div>
                <div style={{ height: '6px', width: '100%', borderRadius: '999px', background: '#eee' }}>
                  <div style={{ height: '6px', borderRadius: '999px', width: `${s.val}%`, backgroundColor: s.val >= 80 ? '#28A745' : s.val >= 50 ? '#FFC107' : '#DC3545' }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle style={{ fontSize: '13px', fontWeight: 600 }} className="flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> TOP 5</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {approvedTop5.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px', fontSize: '13px', color: '#999' }}>Nenhuma unidade promovida ao TOP 5 ainda.</p>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {approvedTop5.map((entry, i) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: unit?.nomeFantasia === entry.name ? '#FFF8E1' : '#FAFAFA' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', background: colors[i] ?? '#9E9E9E' }}>{entry.pos}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600 }}>{entry.name} {unit?.nomeFantasia === entry.name ? '(você)' : ''}</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{entry.growth}</span>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle style={{ fontSize: '13px', fontWeight: 600 }}>Ranking de Unidades</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">TCEs</TableHead>
                <TableHead className="text-right">Crescimento</TableHead>
                <TableHead className="text-right">Ranking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByTces.map((u, i) => (
                <TableRow key={u.id} style={{ background: u.id === unit?.id ? '#FFF8E1' : undefined }}>
                  <TableCell>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', background: colors[i] ?? '#BDBDBD' }}>{i + 1}</div>
                  </TableCell>
                  <TableCell style={{ fontWeight: u.id === unit?.id ? 700 : 400 }}>{u.nomeFantasia} {u.id === unit?.id ? '(você)' : ''}</TableCell>
                  <TableCell className="text-right font-semibold">{u.tces}</TableCell>
                  <TableCell className={`text-right font-semibold ${u.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{u.growth >= 0 ? '+' : ''}{u.growth}</TableCell>
                  <TableCell className="text-right text-muted-foreground">#{u.ranking}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}