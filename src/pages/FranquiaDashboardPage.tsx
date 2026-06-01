import { useAuth } from '@/contexts/AuthContext';
import { useUnit } from '@/hooks/useUnits';
import { useNotices } from '@/hooks/useNotices';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { SituationScale } from '@/components/shared/SituationScale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, TrendingUp, Users, Eye, Store, Loader2 } from 'lucide-react';

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function FranquiaDashboardPage() {
  const { user } = useAuth();
  const { data: unit, isLoading, error } = useUnit(user?.unitId ?? '');
  const { data: notices = [] } = useNotices();

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
        <div className="flex items-center gap-3.5">
          <h1 className="text-xl font-bold">Minha Franquia</h1>
        </div>
        <EmptyState icon={Store} title="Unidade não encontrada" description="Sua franquia ainda não foi configurada. Entre em contato com o administrador." />
      </div>
    );
  }

  const historyData = months.map((month, i) => ({
    month,
    value: Math.round(unit.tces * (0.4 + (i + 1) / 12) * (1 + (Math.random() - 0.5) * 0.08)),
  }));

  const statusMap: Record<string, string> = {
    Operacional: 'Saudavel',
    Critica: 'Atencao',
    'Em Acompanhamento': 'Atencao',
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            {getInitials(unit.nomeFantasia)}
          </div>
          <div>
            <h1 className="text-xl font-bold">Minha Franquia</h1>
            <p className="text-sm text-muted-foreground">{unit.nomeFantasia} • {unit.razaoSocial}</p>
          </div>
          <SituationScale current={statusMap[unit.status] ?? 'Saudavel'} />
        </div>
        <div className="flex gap-2">
          {unit.ranking <= 5 && (
            <Badge variant="outline" className="gap-1.5 border-yellow-200 bg-yellow-50 text-yellow-700">
              <Trophy className="h-4 w-4" /> TOP 5 • #{unit.ranking} no Ranking
            </Badge>
          )}
          <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" /> {unit.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3.5">
        <StatCard label="TCEs Ativos" value={String(unit.tces)} trend="+8 este mês" trendUp>
          <div className="flex items-end gap-0.5 h-6">
            {historyData.map((v, i) => (
              <div key={i} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${(v.value / Math.max(...historyData.map(d => d.value))) * 100}%` }} />
            ))}
          </div>
        </StatCard>
        <StatCard label="Crescimento" value={`${unit.growth >= 0 ? '+' : ''}${unit.growth}%`} trend="+5.1%" trendUp>
          <div className="flex items-end gap-0.5 h-6">
            {[35,38,40,37,42,39,44,41,46,43,45,42].map((v, i) => (
              <div key={i} className={`flex-1 rounded-sm ${v > 40 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ height: `${(v/46)*100}%`, opacity: 0.7 }} />
            ))}
          </div>
        </StatCard>
        <StatCard label="Posição no Ranking" value={`#${unit.ranking}`} trend="de 156" trendUp>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-yellow-500" style={{ width: `${Math.max(1, 100 - unit.ranking * 0.6)}%` }} />
          </div>
          <p className="text-[10px] font-semibold text-yellow-600 mt-1">Top {Math.round((unit.ranking / 156) * 100)}% da rede</p>
        </StatCard>
        <StatCard label="Engajamento" value={`${unit.engagement}%`} trend="+3%" trendUp>
          <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${unit.engagement}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[10px]">
            <span className="text-muted-foreground">Presença em treinamentos</span>
            <span className="text-green-600 font-semibold">{unit.engagement >= 75 ? 'Meta: 75% ✓' : 'Abaixo da meta'}</span>
          </div>
        </StatCard>
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Evolução Histórica</CardTitle>
              <div className="flex gap-1 rounded-md bg-muted p-0.5">
                {['3M','6M','1A'].map((t, i) => (
                  <button key={t} className={`px-2.5 py-1 text-xs rounded font-medium ${i===1?'bg-blue-500 text-white':'text-muted-foreground'}`}>{t}</button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={historyData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[3,3,0,0]}>
                  {historyData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.value > 100 ? '#28A745' : entry.value > 80 ? '#007BFF' : '#FFC107'} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Comparativos</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-0">
            {[
              { label: 'Crescimento', you: unit.growth, avg: 18.5 },
              { label: 'Engajamento', you: unit.engagement, avg: 78.2 },
            ].map((c) => (
              <div key={c.label} className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground">{c.label}</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-semibold w-8">Você</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, c.you)}%` }} />
                  </div>
                  <span className="font-bold text-primary">{c.you}{typeof c.you === 'number' ? '%' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-semibold w-8 text-muted-foreground">Média</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-gray-300" style={{ width: `${Math.min(100, c.avg)}%` }} />
                  </div>
                  <span className="font-bold text-muted-foreground">{c.avg}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3.5">
        <Card className="col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Avisos da Franqueadora</CardTitle></CardHeader>
          <CardContent className="space-y-0 pt-0">
            {notices.length === 0 ? (
              <p className="py-4 text-xs text-muted-foreground text-center">Nenhum aviso no momento.</p>
            ) : (
              notices.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-3 border-b border-border py-2.5 last:border-0">
                  {a.important ? (
                    <span className="rounded bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-700">IMPORTANTE</span>
                  ) : (
                    <span className="w-12" />
                  )}
                  <span className="flex-1 text-sm truncate">{a.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</span>
                  <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Destaques</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            {[
              { icon: Trophy, color: '#FFC107', label: unit.ranking <= 5 ? 'TOP 5' : 'Ranking #' + unit.ranking, sub: `Posição atual no ranking` },
              { icon: TrendingUp, color: '#28A745', label: `Crescimento ${unit.growth >= 0 ? '+' : ''}${unit.growth}%`, sub: unit.growth >= 20 ? 'Acima da média da rede' : 'Dentro da média' },
              { icon: Users, color: '#007BFF', label: `Engajamento ${unit.engagement}%`, sub: unit.engagement >= 75 ? 'Meta de presença atingida' : 'Abaixo da meta de 75%' },
            ].map((h, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md shrink-0" style={{ backgroundColor: h.color + '15' }}>
                  <h.icon className="h-3.5 w-3.5" style={{ color: h.color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold">{h.label}</p>
                  <p className="text-[11px] text-muted-foreground">{h.sub}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
