import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, Check, Copy, CheckCheck, FileText, Users, History, TrendingUp, TrendingDown, ClipboardList, X, Save, Loader2 } from 'lucide-react';
import { useCSVImport } from '@/hooks/useCSVImport';
import { saveTCEImport, saveTrainingPresence, createUnitsBulk } from '@/services/dataService';

type ImportType = 'tce' | 'training' | 'legacy';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const INSTRUCTIONS: Record<ImportType, string> = {
  tce: `Informe a data no campo acima, depois cole os nomes das unidades (um por linha).
O app conta quantas vezes cada unidade aparece e compara com o último dia do mês anterior.
Exemplo:
Unidade Centro
Unidade Norte
Unidade Centro
Unidade Sul`,
  training: `Franquia,07/05,14/05,21/05
Araraquara,,ok,ok
Atibaia,ok,ok,ok`,
  legacy: `Cole os dados históricos de TCE.
Formato: data;nome da unidade;quantidade
Exemplo:
01/06/2026;Unidade Centro;45
01/06/2026;Unidade Norte;32
01/06/2026;Unidade Sul;28`,
};

const PLACEHOLDERS: Record<ImportType, string> = {
  tce: 'Unidade Centro\nUnidade Norte\nUnidade Centro\nUnidade Sul',
  training: 'Franquia,07/05,14/05,21/05\nAraraquara,,ok,ok\nAtibaia,ok,ok,ok',
  legacy: '01/06/2026;Unidade Centro;45\n01/06/2026;Unidade Norte;32\n01/06/2026;Unidade Sul;28',
};

interface TypeCardDef {
  type: ImportType;
  label: string;
  desc: string;
  icon: typeof TrendingUp;
  activeBorder: string;
  activeBg: string;
  activeIcon: string;
}

const typeCards: TypeCardDef[] = [
  {
    type: 'tce',
    label: 'TCEs Diários',
    desc: 'Export diário do sistema',
    icon: TrendingUp,
    activeBorder: 'border-green-500',
    activeBg: 'bg-green-50/50',
    activeIcon: 'text-green-600',
  },
  {
    type: 'training',
    label: 'Presença Treinamentos',
    desc: 'Lista de presença',
    icon: ClipboardList,
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-50/50',
    activeIcon: 'text-blue-600',
  },
  {
    type: 'legacy',
    label: 'Histórico Legado',
    desc: 'Dados históricos',
    icon: History,
    activeBorder: 'border-yellow-500',
    activeBg: 'bg-yellow-50/50',
    activeIcon: 'text-yellow-600',
  },
];

interface LegacyData {
  headers: string[];
  rows: string[][];
  errors: string[];
}

export default function ImportacaoPage() {
  const queryClient = useQueryClient();
  const { result, trainingResult, importDailyTCE, importTraining, reset } = useCSVImport();
  const [importType, setImportType] = useState<ImportType>('tce');
  const [csvText, setCsvText] = useState('');
  const [copied, setCopied] = useState(false);
  const [legacyData, setLegacyData] = useState<LegacyData | null>(null);

  const today = new Date().toLocaleDateString('pt-BR');
  const [importDate, setImportDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [unknownUnits, setUnknownUnits] = useState<string[]>([]);
  const [comparison, setComparison] = useState<{ razaoSocial: string; yesterday: number; today: number; diff: number }[] | null>(null);
  const [previewComparison, setPreviewComparison] = useState<{ razaoSocial: string; yesterday: number; today: number; diff: number }[] | null>(null);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const validateUnits = useCallback(async (names: string[]) => {
    const unique = [...new Set(names.filter(Boolean))];
    try {
      const { fetchUnits } = await import('@/services/dataService');
      const existing = await fetchUnits();
      const existingNames = new Set(existing.map((u) => u.nomeFantasia));
      const missing = unique.filter((n) => !existingNames.has(n));
      setUnknownUnits(missing);
    } catch {
      setUnknownUnits([]);
    }
  }, []);

  useEffect(() => {
    if (result && importType === 'tce') {
      const names = Object.keys(result.summary);
      validateUnits(names);
      (async () => {
        try {
          const { collection, query, where, orderBy, getDocs, limit } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const isoDate = importDate.split('/').reverse().join('-');
          const prevSnap = await getDocs(query(collection(db, 'tce_history'), orderBy('date', 'desc'), limit(100)));
          const seenDates = new Set<string>();
          let prevDate = '';
          for (const d of prevSnap.docs) {
            const date = d.data().date as string;
            if (date !== isoDate && !seenDates.has(date)) {
              prevDate = date;
              break;
            }
            seenDates.add(date);
          }
          const prev: Record<string, number> = {};
          if (prevDate) {
            const daySnap = await getDocs(query(collection(db, 'tce_history'), where('date', '==', prevDate)));
            daySnap.docs.forEach(d => { prev[d.data().razaoSocial] = d.data().totalTCE; });
          }
          const comp = Object.entries(result.summary).map(([r, t]) => ({ razaoSocial: r, yesterday: prev[r] ?? 0, today: t, diff: t - (prev[r] ?? 0) }));
          setPreviewComparison(comp);
          const existing = await getDocs(query(collection(db, 'tce_history'), where('date', '==', isoDate)));
          setHasExistingData(existing.size > 0);
        } catch {}
      })();
    } else if (legacyData && importType === 'legacy') {
      const names = legacyData.rows.map((r) => r[1] ?? '');
      validateUnits(names);
      (async () => {
        try {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const isoDate = (legacyData.rows[0]?.[0] ?? '').split('/').reverse().join('-');
          if (isoDate && isoDate.length === 10) {
            const existing = await getDocs(query(collection(db, 'tce_history'), where('date', '==', isoDate)));
            setHasExistingData(existing.size > 0);
          }
        } catch {}
      })();
    } else {
      setUnknownUnits([]);
    }
  }, [result, legacyData, importType, validateUnits]);

  const hasResult = result !== null || trainingResult !== null || legacyData !== null;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError('');
    try {
      if ((hasExistingData && !confirmOverwrite) || unknownUnits.length > 0) { setSaving(false); return; }
      const isoDate = importDate.split('/').reverse().join('-');
      if (confirmOverwrite) {
        const { collection, query, where, getDocs, deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const existing = await getDocs(query(collection(db, 'tce_history'), where('date', '==', isoDate)));
        for (const d of existing.docs) await deleteDoc(doc(db, 'tce_history', d.id));
      }
      if (importType === 'tce' && result) {
        const ret = await saveTCEImport({ date: importDate, rows: result.rows, summary: result.summary });
        setComparison(ret.comparison);
      } else if (importType === 'training' && trainingResult) {
        await saveTrainingPresence({ rows: trainingResult.rows, dates: trainingResult.dates });
      } else if (importType === 'legacy' && legacyData && legacyData.rows.length > 0) {
        const rows = legacyData.rows.map((r) => ({ razaoSocial: r[1] ?? '' }));
        const summary: Record<string, number> = {};
        for (const r of legacyData.rows) {
          const name = r[1] ?? '';
          const tces = parseInt(r[2] ?? '0', 10);
          summary[name] = (summary[name] ?? 0) + tces;
        }
        const date = legacyData.rows[0]?.[0] ?? importDate;
        const ret = await saveTCEImport({ date, rows, summary });
        setComparison(ret.comparison);
      }
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['units'] });
    } catch (err) {
      console.error('Erro ao salvar importação:', err);
      setSaveError('Erro ao salvar no banco. Verifique as regras do Firestore.');
    } finally {
      setSaving(false);
    }
  }, [importType, result, trainingResult, legacyData, importDate]);

  const handleCopyInstructions = useCallback(async () => {
    await navigator.clipboard.writeText(INSTRUCTIONS[importType]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [importType]);

  const handleProcess = useCallback(() => {
    if (!csvText.trim()) return;
    reset();
    setLegacyData(null);
    setSaved(false);
    setHasExistingData(false);
    setConfirmOverwrite(false);

    if (importType === 'tce') {
      importDailyTCE(csvText);
    } else if (importType === 'training') {
      importTraining(csvText);
    } else {
      const lines = csvText.trim().split('\n').filter((l) => l.trim());
      const errors: string[] = [];
      if (lines.length < 1) {
        setLegacyData({ headers: [], rows: [], errors: ['CSV vazio'] });
        return;
      }
      const headers = parseCSVLine(lines[0]);
      const rows: string[][] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 1) {
          errors.push(`Linha ${i + 1}: vazia`);
          continue;
        }
        rows.push(cols);
      }
      setLegacyData({ headers, rows, errors });
    }
  }, [csvText, importType, importDailyTCE, importTraining, reset]);

  const handleReset = useCallback(() => {
    reset();
    setCsvText('');
    setLegacyData(null);
    setSaved(false);
    setComparison(null);
    setPreviewComparison(null);
    setConfirmOverwrite(false);
    setImportDate(new Date().toLocaleDateString('pt-BR'));
  }, [reset]);

  const handleCancel = useCallback(() => {
    setCsvText('');
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Importar Dados CSV" description="Faça upload ou cole os dados para processamento" />

      {hasResult ? (
        <>
          {importType === 'tce' && result && (
            <div className="space-y-5">
              {result.rows.length > 0 ? (
                <>
                  <div className="flex items-center justify-end">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleReset}>
                      ← Nova importação
                    </Button>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center">
                        Comparação de TCEs
                        <Badge variant="secondary" className="ml-2" style={{ color: '#fff', marginLeft: '12px' }}>{result.rows.length} registros</Badge>
                        {saved && <Badge variant="outline" className="ml-2 text-xs" style={{ marginLeft: '8px' }}>{importDate}</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Unidade</TableHead>
                            <TableHead className="text-center">Anterior</TableHead>
                            <TableHead className="text-center">{importDate}</TableHead>
                            <TableHead className="text-center">Diferença</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(comparison ?? previewComparison ?? Object.entries(result.summary).map(([r, t]) => ({ razaoSocial: r, yesterday: 0, today: t, diff: t }))).map((row) => {
                            const isUnknown = unknownUnits.includes(row.razaoSocial);
                            return (
                            <TableRow key={row.razaoSocial} style={isUnknown ? { background: '#FFF0F0' } : undefined}>
                              <TableCell className="font-medium" style={isUnknown ? { color: '#DC3545' } : undefined}>
                                {row.razaoSocial} {isUnknown && <span style={{ fontSize: '10px', color: '#DC3545' }}>(não cadastrada)</span>}
                              </TableCell>
                              <TableCell className="text-center text-muted-foreground">{row.yesterday}</TableCell>
                              <TableCell className="text-center font-semibold">{row.today}</TableCell>
                              <TableCell className="text-center">
                                {row.diff > 0 && (
                                  <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                                    <TrendingUp className="h-3.5 w-3.5" /> +{row.diff} cliente{row.diff !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {row.diff < 0 && (
                                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                                    <TrendingDown className="h-3.5 w-3.5" /> {row.diff} cliente{row.diff !== -1 ? 's' : ''}
                                  </span>
                                )}
                                {row.diff === 0 && (
                                  <span className="text-xs text-muted-foreground">—
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {result.errors.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-destructive">Erros Encontrados</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="list-disc list-inside space-y-1">
                          {result.errors.map((err, i) => (
                            <li key={i} className="text-xs text-muted-foreground">{err}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {saveError && <p className="text-center text-sm text-red-600">{saveError}</p>}

                  {unknownUnits.length > 0 && (
                    <Card style={{ borderColor: '#DC3545' }}>
                      <CardContent style={{ padding: '12px' }}>
                        <p className="text-sm font-semibold text-red-600">
                          {unknownUnits.length} unidade{unknownUnits.length !== 1 ? 's' : ''} não cadastrada{unknownUnits.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Cadastre as unidades antes de importar os TCEs.</p>
                      </CardContent>
                    </Card>
                  )}

                  {hasExistingData && !confirmOverwrite && (
                    <Card style={{ borderColor: '#FFC107' }}>
                      <CardContent style={{ padding: '12px' }}>
                        <p className="text-sm font-semibold text-yellow-700">Já existem dados para esta data</p>
                        <p className="text-xs text-muted-foreground mt-1">Deseja sobrescrever os registros existentes?</p>
                        <button type="button" onClick={() => setConfirmOverwrite(true)} style={{ marginTop: '8px', padding: '6px 16px', background: '#DC3545', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Sobrescrever</button>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-center gap-3">
                    {!saved ? (
                      <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving || result.rows.length === 0 || unknownUnits.length > 0 || (hasExistingData && !confirmOverwrite)}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar no Banco
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200" disabled>
                        <CheckCheck className="h-4 w-4" /> Dados Salvos
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Nova importação
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="Nenhum dado importado"
                  description="Nenhuma linha válida encontrada no CSV. Verifique o formato e tente novamente."
                />
              )}

              {saveError && <p className="text-center text-sm text-red-600">{saveError}</p>}

              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

          {importType === 'training' && trainingResult && (
            <div className="space-y-5">
              {trainingResult.rows.length > 0 ? (
                <>
                  <div className="flex items-center justify-end">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleReset}>
                      ← Nova importação
                    </Button>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center">
                        Presença em Treinamentos
                        <Badge variant="secondary" className="ml-2" style={{ color: '#fff', marginLeft: '12px' }}>{trainingResult.rows.length} unidades</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="min-w-40">Unidade</TableHead>
                              {trainingResult.dates.map((date) => (
                                <TableHead key={date} className="text-center">{date}</TableHead>
                              ))}
                              <TableHead className="text-center w-16">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trainingResult.rows.map((row) => {
                              const total = row.dates.filter((d) => d.present).length;
                              return (
                                <TableRow key={row.unitName}>
                                  <TableCell className="font-medium">{row.unitName}</TableCell>
                                  {row.dates.map((d, idx) => (
                                    <TableCell key={idx} className="text-center">
                                      {d.present ? (
                                        <Check className="h-4 w-4 text-green-600 mx-auto" />
                                      ) : (
                                        <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
                                      )}
                                    </TableCell>
                                  ))}
                                  <TableCell className="text-center">
                                    <Badge variant={total > 0 ? 'default' : 'secondary'}>{total}</Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {trainingResult.errors.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-destructive">Erros Encontrados</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="list-disc list-inside space-y-1">
                          {trainingResult.errors.map((err, i) => (
                            <li key={i} className="text-xs text-muted-foreground">{err}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-center gap-3">
                    {!saved ? (
                      <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving || trainingResult.rows.length === 0}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar no Banco
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200" disabled>
                        <CheckCheck className="h-4 w-4" /> Dados Salvos
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Nova importação
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={Users}
                  title="Nenhum dado importado"
                  description="Nenhuma linha válida encontrada no CSV. Verifique o formato e tente novamente."
                />
              )}

              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

          {importType === 'legacy' && legacyData && (
            <div className="space-y-5">
              {legacyData.rows.length > 0 ? (
                <>
                  <div className="flex items-center justify-end">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleReset}>
                      ← Nova importação
                    </Button>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center">
                        Pré-visualização Histórico Legado
                        <Badge variant="secondary" className="ml-2" style={{ color: '#fff', marginLeft: '12px' }}>{legacyData.rows.length} linhas</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {legacyData.headers.map((header, i) => (
                                <TableHead key={i}>{header}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {legacyData.rows.map((row, rowIdx) => {
                              const isUnknown = unknownUnits.includes(row[1] ?? '');
                              return (
                              <TableRow key={rowIdx} style={isUnknown ? { background: '#FFF0F0' } : undefined}>
                                {row.map((cell, cellIdx) => (
                                  <TableCell key={cellIdx} style={cellIdx === 1 && isUnknown ? { color: '#DC3545' } : undefined}>
                                    {cell}{cellIdx === 1 && isUnknown ? ' (não cadastrada)' : ''}
                                  </TableCell>
                                ))}
                              </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {legacyData.errors.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-destructive">Erros Encontrados</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="list-disc list-inside space-y-1">
                          {legacyData.errors.map((err, i) => (
                            <li key={i} className="text-xs text-muted-foreground">{err}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {unknownUnits.length > 0 && (
                    <Card style={{ borderColor: '#DC3545' }}>
                      <CardContent style={{ padding: '12px' }}>
                        <p className="text-sm font-semibold text-red-600">
                          {unknownUnits.length} unidade{unknownUnits.length !== 1 ? 's' : ''} não cadastrada{unknownUnits.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Cadastre as unidades antes de importar os TCEs.</p>
                      </CardContent>
                    </Card>
                  )}

                  {hasExistingData && !confirmOverwrite && (
                    <Card style={{ borderColor: '#FFC107' }}>
                      <CardContent style={{ padding: '12px' }}>
                        <p className="text-sm font-semibold text-yellow-700">Já existem dados para esta data</p>
                        <p className="text-xs text-muted-foreground mt-1">Deseja sobrescrever os registros existentes?</p>
                        <button type="button" onClick={() => setConfirmOverwrite(true)} style={{ marginTop: '8px', padding: '6px 16px', background: '#DC3545', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Sobrescrever</button>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-center gap-3">
                    {!saved ? (
                      <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving || legacyData.rows.length === 0 || unknownUnits.length > 0 || (hasExistingData && !confirmOverwrite)}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {saving ? 'Salvando...' : 'Salvar como Unidades'}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200" disabled>
                        <CheckCheck className="h-4 w-4" /> Unidades Salvas
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Nova importação
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={History}
                  title="Nenhum dado importado"
                  description="Nenhuma linha válida encontrada no CSV. Verifique o formato e tente novamente."
                />
              )}

              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Formato de Importação</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleCopyInstructions}>
                {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado!' : 'Copiar instruções'}
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">
                {INSTRUCTIONS[importType]}
              </pre>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3.5">
            {typeCards.map((t) => {
              const isActive = importType === t.type;
              return (
                <Card
                  key={t.type}
                  className={`cursor-pointer border-2 transition-all ${isActive ? `${t.activeBorder} ${t.activeBg}` : 'border-border hover:border-primary/30'}`}
                  onClick={() => setImportType(t.type)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <t.icon className={`h-5 w-5 ${isActive ? t.activeIcon : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-semibold">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {importType === 'tce' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Data dos TCEs</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <input
                  type="text"
                  value={importDate}
                  onChange={(e) => setImportDate(e.target.value)}
                  placeholder="dd/mm/aaaa"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </CardContent>
            </Card>
          )}

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <UploadCloud className="h-10 w-10 text-muted-foreground/40" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Arraste o arquivo CSV aqui ou cole os dados abaixo</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Formatos aceitos: delimitado por vírgula (,) ou ponto-e-vírgula (;)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Colar dados CSV</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                className="min-h-[260px] font-mono text-sm"
                rows={10}
                placeholder={PLACEHOLDERS[importType]}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button className="gap-1.5" onClick={handleProcess} disabled={!csvText.trim()}>
              <Check className="h-4 w-4" /> Processar Dados
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
