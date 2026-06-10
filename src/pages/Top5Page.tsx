import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { useTop5, useUpdateTop5, useDeleteTop5 } from '@/hooks/useTop5';
import { useUnits } from '@/hooks/useUnits';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { collection, getDocs, addDoc, doc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Role } from '@/types';

function calcStatus(diff: number): string {
  if (diff >= 10) return 'Destaque';
  if (diff >= 0) return 'Operacional';
  if (diff > -5) return 'Queda';
  if (diff > -10) return 'Atenção';
  return 'Crítico';
}

export default function Top5Page() {
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const canAudit = hasPermission(role, 'canAuditTop5');
  const { data: entries = [], isLoading, error } = useTop5();
  const updateTop5 = useUpdateTop5();
  const deleteTop5 = useDeleteTop5();
  const queryClient = useQueryClient();
  const { data: units = [] } = useUnits();
  const [unitMonthly, setUnitMonthly] = useState<Record<string, Record<string, number>>>({});
  const [trainingData, setTrainingData] = useState<Record<string, { attended: number; total: number }>>({});
  const [auditTarget, setAuditTarget] = useState<{ unit: string; growth: number; engagement: number } | null>(null);
  const [promoteResult, setPromoteResult] = useState<{ name: string; pos: number; duplicate?: boolean } | null>(null);
  const [auditSocial, setAuditSocial] = useState('OK');
  const [auditPayment, setAuditPayment] = useState('OK');
  const [saving, setSaving] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);

  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const monthKey = `${year}-${String(viewMonth).padStart(2, '0')}`;
  const prevMonthKey = `${year}-${String(viewMonth - 1).padStart(2, '0')}`;
  const isCurrentMonth = viewMonth === currentMonth;

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'tce_history'), orderBy('date', 'asc')));
        const byUnit: Record<string, Record<string, number>> = {};
        snap.docs.forEach(d => {
          const mKey = (d.data().date as string).slice(0, 7);
          const unit = d.data().razaoSocial as string;
          const tces = d.data().totalTCE as number;
          if (!byUnit[unit]) byUnit[unit] = {};
          byUnit[unit][mKey] = tces;
        });
        setUnitMonthly(byUnit);
      } catch {}
    })();
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'training_presence'));
        const byUnit: Record<string, { attended: number; total: number }> = {};
        snap.docs.forEach(d => {
          const unit = d.data().unitName as string;
          const present = d.data().present as boolean;
          if (!byUnit[unit]) byUnit[unit] = { attended: 0, total: 0 };
          byUnit[unit].total++;
          if (present) byUnit[unit].attended++;
        });
        setTrainingData(byUnit);
      } catch {}
    })();
  }, []);

  const candidates = isCurrentMonth ? units.map(u => {
    const curr = unitMonthly[u.nomeFantasia]?.[monthKey] ?? 0;
    const prev = unitMonthly[u.nomeFantasia]?.[prevMonthKey] ?? 0;
    const growth = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : curr > 0 ? 100 : 0;
    const train = trainingData[u.nomeFantasia];
    const engagement = train ? Math.round((train.attended / train.total) * 100) : 0;
    return { ...u, growth, growthOk: growth > 0, engagement, engagementOk: engagement >= 80 };
  }).filter(c => c.growthOk).sort((a, b) => b.growth - a.growth) : [];

  const handleOpenAudit = (unit: typeof candidates[0]) => {
    setAuditTarget({ unit: unit.nomeFantasia, growth: unit.growth, engagement: unit.engagement });
    setAuditSocial('OK');
    setAuditPayment('OK');
  };

  const handleSaveAudit = async () => {
    if (!auditTarget) return;
    const already = entries.find(e => e.name === auditTarget.unit);
    if (already) {
      setPromoteResult({ name: auditTarget.unit, pos: already.pos, duplicate: true });
      setAuditTarget(null);
      return;
    }
    setSaving(true);
    try {
      const allOk = auditSocial === 'OK' && auditPayment === 'OK';
      await addDoc(collection(db, 'top5_audit'), {
        name: auditTarget.unit,
        pos: candidates.findIndex(c => c.nomeFantasia === auditTarget.unit) + 1,
        growth: `${auditTarget.growth >= 0 ? '+' : ''}${auditTarget.growth}`,
        training: 'OK',
        social: auditSocial,
        payment: auditPayment,
        status: allOk ? 'Aprovada' : 'Pendente',
        month: monthKey,
        createdAt: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['top5'] });
      const pos = candidates.findIndex(c => c.nomeFantasia === auditTarget.unit) + 1;
      setPromoteResult({ name: auditTarget.unit, pos });
      setAuditTarget(null);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="TOP 5" description="Premiação mensal das melhores unidades" />
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="TOP 5" description="Premiação mensal das melhores unidades">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button type="button" onClick={() => setViewMonth(Math.max(1, viewMonth - 1))} style={{ padding: '2px 8px', fontSize: '14px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: '#eee', color: '#666' }}>‹</button>
            <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '50px', textAlign: 'center' }}>{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][viewMonth - 1]}</span>
            <button type="button" onClick={() => setViewMonth(Math.min(12, viewMonth + 1))} style={{ padding: '2px 8px', fontSize: '14px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: '#eee', color: '#666' }}>›</button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-yellow-200 bg-yellow-50 text-yellow-700 px-3 py-1.5 text-sm font-semibold">
              {entries.filter(e => e.status === 'Pendente' && e.month === monthKey).length} Pendente
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-600 px-3 py-1.5 text-sm font-semibold">
              {entries.filter(e => e.status === 'Aprovada' && e.month === monthKey).length} Aprovada
            </Badge>
          </div>
        </div>
      </PageHeader>

      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> TOP 5</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Crescimento</TableHead>
                  <TableHead className="text-center">Engajamento</TableHead>
                  <TableHead className="text-center">Social</TableHead>
                  <TableHead className="text-center">Pagamento</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  {canAudit && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.filter(e => !e.month || e.month === monthKey).sort((a, b) => a.pos - b.pos).map((entry) => (
                  <TableRow key={(entry as any).id ?? entry.name} style={{ opacity: entry.status === 'Rejeitada' ? 0.4 : 1 }}>
                    <TableCell>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', background: entry.pos <= 3 ? (entry.pos === 1 ? '#FFC107' : entry.pos === 2 ? '#9E9E9E' : '#CD7F32') : '#BDBDBD' }}>{entry.pos}</div>
                    </TableCell>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell className={`text-right font-semibold ${entry.growth.startsWith('+') || !entry.growth.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>{entry.growth.replace('%', '')}</TableCell>
                    <TableCell className="text-center"><span style={{ color: trainingData[entry.name] ? '#2E7D32' : '#F57F17', fontWeight: 600 }}>{trainingData[entry.name] ? Math.round((trainingData[entry.name].attended / trainingData[entry.name].total) * 100) + '%' : '0%'}</span></TableCell>
                    <TableCell className="text-center"><span style={{ color: entry.social === 'OK' ? '#2E7D32' : '#F57F17', fontWeight: 600 }}>{entry.social}</span></TableCell>
                    <TableCell className="text-center"><span style={{ color: entry.payment === 'OK' ? '#2E7D32' : '#F57F17', fontWeight: 600 }}>{entry.payment}</span></TableCell>
                    <TableCell className="text-center"><StatusBadge status={entry.status === 'Aprovada' ? 'Destaque' : entry.status === 'Rejeitada' ? 'Crítico' : 'Atenção'} /></TableCell>
                    {canAudit && (
                      <TableCell className="text-right">
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          {entry.status !== 'Aprovada' && entry.status !== 'Rejeitada' && (
                            <button type="button" onClick={() => updateTop5.mutate({ id: (entry as any).id, data: { status: 'Aprovada' } })} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#2E7D32' }}><CheckCircle className="h-4 w-4" /></button>
                          )}
                          {entry.status !== 'Rejeitada' && (
                            <button type="button" onClick={async () => { try { const snap = await getDocs(query(collection(db, 'top5_audit'), where('name', '==', entry.name))); await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'top5_audit', d.id)))); queryClient.invalidateQueries({ queryKey: ['top5'] }); } catch (e) { console.error(e); } }} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#C62828' }} title="Remover"><XCircle className="h-4 w-4" /></button>
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
      )}

      {isCurrentMonth && canAudit && candidates.filter(c => !entries.find(e => e.name === c.nomeFantasia)).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Candidatos Elegíveis</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Crescimento</TableHead>
                  <TableHead className="text-center">Engajamento</TableHead>
                  <TableHead className="text-center">Social</TableHead>
                  <TableHead className="text-center">Pagamento</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.filter(c => !entries.find(e => e.name === c.nomeFantasia)).map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell><span className="font-bold text-sm">{i + 1}</span></TableCell>
                    <TableCell className="font-medium">{c.nomeFantasia}</TableCell>
                    <TableCell className={`text-right font-semibold ${c.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{c.growth >= 0 ? '+' : ''}{c.growth}</TableCell>
                    <TableCell className="text-center"><span style={{ color: c.engagementOk ? '#2E7D32' : '#F57F17' }}>{c.engagement}%</span></TableCell>
                    <TableCell className="text-center"><span style={{ color: '#9E9E9E' }}>—</span></TableCell>
                    <TableCell className="text-center"><span style={{ color: '#9E9E9E' }}>—</span></TableCell>
                    <TableCell className="text-center"><span style={{ fontSize: '12px', color: '#9E9E9E' }}>Pendente</span></TableCell>
                    <TableCell className="text-right">
                      <button type="button" onClick={() => handleOpenAudit(c)} style={{ padding: '4px 12px', background: '#DC3545', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Auditar</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {entries.filter(e => !e.month || e.month === monthKey).length === 0 && (!isCurrentMonth || !canAudit || candidates.filter(c => !entries.find(e => e.name === c.nomeFantasia)).length === 0) && (
        <Card>
          <CardContent style={{ padding: '32px', textAlign: 'center' }}>
            <Trophy className="h-8 w-8" style={{ color: '#FFC107', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][viewMonth - 1]}</p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{isCurrentMonth ? 'Nenhum candidato disponível para este mês.' : 'Nenhum dado histórico disponível para este mês.'}</p>
          </CardContent>
        </Card>
      )}

      {auditTarget && (() => {
        const growthOk = auditTarget.growth > 0;
        const engagementOk = auditTarget.engagement >= 80;
        const socialOk = auditSocial === 'OK';
        const paymentOk = auditPayment === 'OK';
        const allOk = growthOk && engagementOk && socialOk && paymentOk;
        return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }} onClick={() => setAuditTarget(null)}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', minWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Auditar {auditTarget.unit}</h3>
            <div style={{ marginBottom: '16px', padding: '12px', background: '#F5F5F5', borderRadius: '8px' }}>
              <p style={{ fontSize: '13px', marginBottom: '4px' }}>Crescimento: <strong>{auditTarget.growth >= 0 ? '+' : ''}{auditTarget.growth} TCEs</strong> {growthOk ? <span style={{ color: '#2E7D32' }}>✓</span> : <span style={{ color: '#C62828' }}>✗</span>}</p>
              <p style={{ fontSize: '13px' }}>Engajamento: <strong>{auditTarget.engagement}%</strong> {engagementOk ? <span style={{ color: '#2E7D32' }}>✓</span> : <span style={{ color: '#C62828' }}>✗</span>}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Redes Sociais</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['OK', 'Irregular'].map(o => (
                  <button key={o} type="button" onClick={() => setAuditSocial(o)}
                    style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid', fontSize: '13px', cursor: 'pointer', background: auditSocial === o ? '#DC3545' : '#fff', color: auditSocial === o ? '#fff' : '#666', borderColor: auditSocial === o ? '#DC3545' : '#DDD' }}>{o}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pagamento</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['OK', 'Pendente'].map(o => (
                  <button key={o} type="button" onClick={() => setAuditPayment(o)}
                    style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid', fontSize: '13px', cursor: 'pointer', background: auditPayment === o ? '#DC3545' : '#fff', color: auditPayment === o ? '#fff' : '#666', borderColor: auditPayment === o ? '#DC3545' : '#DDD' }}>{o}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setAuditTarget(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #DDD', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
              {allOk ? (
                <button type="button" onClick={handleSaveAudit} disabled={saving} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#DC3545', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>{saving ? 'Salvando...' : 'Promover ao TOP 5'}</button>
              ) : (
                <button type="button" onClick={() => setAuditTarget(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #DDD', background: '#28A745', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>OK</button>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {promoteResult && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }} onClick={() => setPromoteResult(null)}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', textAlign: 'center', minWidth: '300px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', background: promoteResult.pos <= 3 ? (promoteResult.pos === 1 ? '#FFC107' : promoteResult.pos === 2 ? '#9E9E9E' : '#CD7F32') : '#BDBDBD', margin: '0 auto 12px' }}>{promoteResult.pos}</div>
            <p style={{ fontSize: '16px', fontWeight: 700 }}>{promoteResult.name}</p>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{promoteResult.duplicate ? 'Já está no TOP 5' : `Promovida ao TOP 5 na ${promoteResult.pos}ª posição`}</p>
            {promoteResult.duplicate && <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Não é possível promover a mesma unidade mais de uma vez.</p>}
            <button type="button" onClick={() => setPromoteResult(null)} style={{ marginTop: '16px', padding: '8px 24px', borderRadius: '6px', border: 'none', background: '#DC3545', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}