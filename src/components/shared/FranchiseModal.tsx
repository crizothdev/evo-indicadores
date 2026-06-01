import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, AlertCircle, CheckCircle2, Loader2, CheckCheck } from 'lucide-react';
import { useCSVImport } from '@/hooks/useCSVImport';
import { createUnit, createUnitsBulk } from '@/services/dataService';
import type { FranchiseRow } from '@/services/csvParser';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = ['ATIVO', 'Inativo', 'Rescindido', 'Processo', 'Não Finalizado'] as const;
const HOME_OFFICE_OPTIONS = ['HOME OFFICE', 'PRESENCIAL'] as const;

interface ManualFormData {
  razaoSocial: string;
  unidade: string;
  uf: string;
  regiao: string;
  franqueado: string;
  email: string;
  telefone: string;
  cnpj: string;
  status: string;
  homeOffice: string;
  dataInicio: string;
}

const emptyForm: ManualFormData = {
  razaoSocial: '',
  unidade: '',
  uf: '',
  regiao: '',
  franqueado: '',
  email: '',
  telefone: '',
  cnpj: '',
  status: 'ATIVO',
  homeOffice: 'HOME OFFICE',
  dataInicio: '',
};

const COLUMNS: { key: keyof FranchiseRow; label: string }[] = [
  { key: 'razaoSocial', label: 'Razão Social' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'uf', label: 'UF' },
  { key: 'status', label: 'Status' },
];

export function FranchiseModal({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'manual' | 'csv'>('manual');
  const [manualForm, setManualForm] = useState<ManualFormData>(emptyForm);
  const [csvText, setCsvText] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { franchiseResult, importFranchises } = useCSVImport();

  const handleManualChange = (field: keyof ManualFormData, value: string) => {
    setManualForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImportCSV = () => {
    if (csvText.trim()) {
      importFranchises(csvText);
    }
  };

  const handleSaveManual = async () => {
    if (!manualForm.razaoSocial) return;
    setSaving(true);
    try {
      await createUnit({
        razaoSocial: manualForm.razaoSocial,
        nomeFantasia: manualForm.unidade || manualForm.razaoSocial,
        status: 'Operacional',
        tces: 0,
        growth: 0,
        engagement: 0,
        ranking: 999,
        trend: 'stable',
        createdAt: new Date().toISOString(),
      });
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['units'] });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCSV = async () => {
    if (!franchiseResult || franchiseResult.rows.length === 0) return;
    setSaving(true);
    try {
      const units = franchiseResult.rows.map((row) => ({
        razaoSocial: row.razaoSocial,
        nomeFantasia: row.unidade || row.razaoSocial,
        status: 'Operacional' as const,
        tces: 0,
        growth: 0,
        engagement: 0,
        ranking: 999,
        trend: 'stable' as const,
        createdAt: new Date().toISOString(),
      }));
      await createUnitsBulk(units);
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['units'] });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setManualForm(emptyForm);
    setCsvText('');
    setMode('manual');
    setSaved(false);
    setOpen(false);
  };

  const handleSwitchMode = (newMode: 'manual' | 'csv') => {
    if (newMode === 'csv') setCsvText('');
    setMode(newMode);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleCancel(); }}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastrar Franquia</DialogTitle>
        </DialogHeader>

        <div className="flex bg-muted p-1 rounded-lg w-fit" style={{ gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleSwitchMode('manual')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
              mode === 'manual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Cadastro Manual
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('csv')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
              mode === 'csv' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Importar CSV
          </button>
        </div>

        {mode === 'manual' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="razaoSocial">Nome (Razão Social)</Label>
                <Input id="razaoSocial" value={manualForm.razaoSocial} onChange={(e) => handleManualChange('razaoSocial', e.target.value)} placeholder="Razão social da franquia" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unidade">Unidade</Label>
                <Input id="unidade" value={manualForm.unidade} onChange={(e) => handleManualChange('unidade', e.target.value)} placeholder="Número ou nome da unidade" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" value={manualForm.uf} onChange={(e) => handleManualChange('uf', e.target.value)} placeholder="UF" maxLength={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="regiao">Região</Label>
                <Input id="regiao" value={manualForm.regiao} onChange={(e) => handleManualChange('regiao', e.target.value)} placeholder="Região" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="franqueado">Franqueado</Label>
                <Input id="franqueado" value={manualForm.franqueado} onChange={(e) => handleManualChange('franqueado', e.target.value)} placeholder="Nome do franqueado" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={manualForm.email} onChange={(e) => handleManualChange('email', e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" value={manualForm.telefone} onChange={(e) => handleManualChange('telefone', e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" value={manualForm.cnpj} onChange={(e) => handleManualChange('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleManualChange('status', s)}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md border font-medium transition-colors',
                        manualForm.status === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="homeOffice">Home Office</Label>
                <div className="flex flex-wrap gap-1.5">
                  {HOME_OFFICE_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleManualChange('homeOffice', h)}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-md border font-medium transition-colors',
                        manualForm.homeOffice === h
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input id="dataInicio" type="date" value={manualForm.dataInicio} onChange={(e) => handleManualChange('dataInicio', e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
              {saved ? (
                <Button variant="outline" className="text-green-600 border-green-200" disabled><CheckCheck className="h-4 w-4" /> Salvo</Button>
              ) : (
                <Button onClick={handleSaveManual} disabled={saving || !manualForm.razaoSocial}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Salvar
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground" style={{ marginBottom: '16px' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p>Cole o CSV com os dados das franquias. Use <strong>ponto e vírgula (;)</strong> como separador.</p>
                  <p>Colunas: Razão Social;Unidade;UF;Região;Contrato;Franqueado;Data Nascimento;Profissão;CNPJ;CEP;Telefone;Email;Status;Home Office;Data Início</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText('Razão Social;Unidade;UF;Região;Contrato;Franqueado;Data Nascimento;Profissão;CNPJ;CEP;Telefone;Email;Status;Home Office;Data Início')}
                  style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px', background: '#eee', color: '#666', whiteSpace: 'nowrap', cursor: 'pointer' }}
                >
                  Copiar
                </button>
              </div>
            </div>
            <div className="space-y-1.5" style={{ marginBottom: '16px' }}>
              <Label htmlFor="csvText">Cole o CSV aqui</Label>
              <Textarea
                id="csvText"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Razão Social;Unidade;UF;Região;Contrato;Franqueado;..."
                style={{ minHeight: '120px', maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>

            {franchiseResult && (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="font-medium text-sm">{franchiseResult.rows.length} franquias encontradas</span>
                </div>

                {franchiseResult.rows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          {COLUMNS.map((col) => (
                            <th key={col.key} className="text-left py-1.5 px-2 font-medium text-muted-foreground">{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {franchiseResult.rows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            {COLUMNS.map((col) => (
                              <td key={col.key} className="py-1.5 px-2 truncate max-w-[160px]">{row[col.key]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {franchiseResult.errors.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{franchiseResult.errors.length} erro(s)</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-0.5 ml-5 list-disc">
                      {franchiseResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <DialogFooter>
                  {saved ? (
                    <Button variant="outline" className="text-green-600 border-green-200" disabled><CheckCheck className="h-4 w-4" /> Importado</Button>
                  ) : (
                    <Button onClick={handleSaveCSV} disabled={saving || franchiseResult.rows.length === 0}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Confirmar Importação
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}

            {!franchiseResult && (
              <DialogFooter>
                <Button onClick={handleImportCSV} disabled={!csvText.trim()} style={{ background: csvText.trim() ? '#DC3545' : '#D0D0D0', color: csvText.trim() ? '#fff' : '#888', padding: '8px 16px', borderRadius: '6px' }}>
                  <Upload className="h-4 w-4" /> Importar
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
