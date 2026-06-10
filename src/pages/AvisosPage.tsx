import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from '@/hooks/useNotices';
import { useUnits } from '@/hooks/useUnits';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, ChevronRight, Megaphone, Pencil, Trash2, Loader2, Check, Search, X } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { Role, Notice } from '@/types';

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR');
}

function getTagInfo(notice: Notice): { label: string; variant: 'red' | 'yellow' | null } {
  if (notice.title.toUpperCase().includes('URGENTE') || notice.title.startsWith('!')) return { label: 'URGENTE', variant: 'red' };
  if (notice.important) return { label: 'IMPORTANTE', variant: 'yellow' };
  return { label: '', variant: null };
}

type NoticeForm = { title: string; content: string; important: boolean; targets: string[] };

const emptyForm: NoticeForm = { title: '', content: '', important: false, targets: [] };

function FranchisePicker({ selected, onChange }: { selected: string[]; onChange: (vals: string[]) => void }) {
  const { data: units = [] } = useUnits();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sorted = useMemo(() => {
    const selected_ = new Set(selected);
    return [...units].sort((a, b) => {
      const aSel = selected_.has(a.nomeFantasia) ? 0 : 1;
      const bSel = selected_.has(b.nomeFantasia) ? 0 : 1;
      if (aSel !== bSel) return aSel - bSel;
      return a.nomeFantasia.localeCompare(b.nomeFantasia);
    }).filter(u => !search || u.nomeFantasia.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
  }, [units, selected, search]);

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter(s => s !== name) : [...selected, name]);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <Label>Franquias</Label>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', minHeight: '36px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #DDD', cursor: 'pointer', fontSize: '13px' }}>
        {selected.length === 0 ? <span style={{ color: '#999' }}>Todas as unidades (broadcast)</span> : selected.slice(0, 3).map(s => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 6px', borderRadius: '4px', background: '#DC3545', color: '#fff', fontSize: '11px' }}>
            {s} <button type="button" onClick={e => { e.stopPropagation(); toggle(s); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: '12px', lineHeight: 1 }}>×</button>
          </span>
        ))}
        {selected.length > 3 && <span style={{ fontSize: '11px', color: '#888' }}>+{selected.length - 3}</span>}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #DDD', borderRadius: '6px', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #EEE' }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar franquia..." style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #DDD', fontSize: '13px', outline: 'none' }} />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <button type="button" onClick={() => onChange([])} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', textAlign: 'left', color: selected.length === 0 ? '#DC3545' : '#666' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: selected.length === 0 ? '#DC3545' : '#DDD' }}>{selected.length === 0 ? <span style={{ color: '#DC3545', fontSize: '12px' }}>✓</span> : null}</div>
              Todas as unidades (broadcast)
            </button>
            <div style={{ height: '1px', background: '#EEE', margin: '0 12px' }} />
            {sorted.map(u => (
              <button key={u.id} type="button" onClick={() => toggle(u.nomeFantasia)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', textAlign: 'left', color: '#333' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: selected.includes(u.nomeFantasia) ? '#DC3545' : '#DDD' }}>{selected.includes(u.nomeFantasia) ? <span style={{ color: '#DC3545', fontSize: '12px' }}>✓</span> : null}</div>
                {u.nomeFantasia}
              </button>
            ))}
          </div>
          <div style={{ padding: '8px', borderTop: '1px solid #EEE' }}>
            <button type="button" onClick={() => setOpen(false)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: '#DC3545', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Confirmar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AvisosPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const { data: notices = [], isLoading, error } = useNotices();
  const { data: units = [] } = useUnits();
  const isFranchise = role === 'franchise';
  const userUnitName = isFranchise ? units.find(u => u.id === user?.unitId)?.nomeFantasia ?? '' : '';
  const filteredNotices = isFranchise && userUnitName
    ? notices.filter(n => n.target === 'all' || (n.target || '').split(',').includes(userUnitName))
    : notices;
  const updateNotice = useUpdateNotice();
  const deleteNotice = useDeleteNotice();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<NoticeForm>(emptyForm);

  const selected = filteredNotices.find((n) => n.id === selectedId) ?? filteredNotices[0];

  const canManage = hasPermission(role, 'canManageNotices');

  const handleCreate = () => {
    const isBroadcast = form.targets.length === 0;
    createNotice.mutate({ title: form.title, content: form.content, important: form.important, createdBy: user?.id ?? '', target: isBroadcast ? 'all' : form.targets.join(',') });
    setForm(emptyForm);
    setCreateOpen(false);
  };

  const handleEdit = () => {
    if (!editingId) return;
    const isBroadcast = form.targets.length === 0;
    updateNotice.mutate({ id: editingId, data: { title: form.title, content: form.content, important: form.important, target: isBroadcast ? 'all' : form.targets.join(',') } });
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aviso?')) {
      deleteNotice.mutate(id);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const openEdit = (notice: Notice) => {
    setForm({ title: notice.title, content: notice.content, important: notice.important, targets: notice.target === 'all' ? [] : (notice.target || '').split(',') });
    setSelectedId(notice.id);
    setEditOpen(true);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setCreateOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Avisos e Comunicados" description="Gerencie a comunicação com as franquias" />
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Avisos e Comunicados" description="Gerencie a comunicação com as franquias">
        {canManage && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger>
              <Button size="sm" className="gap-1.5" onClick={openCreate}><Plus className="h-4 w-4" /> Novo Aviso</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Aviso</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do aviso" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea id="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Conteúdo do aviso..." className="min-h-[120px]" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.important} onChange={(e) => setForm({ ...form, important: e.target.checked })} className="rounded" />
                  Marcar como importante
                </label>
                <FranchisePicker selected={form.targets} onChange={(vals) => setForm({ ...form, targets: vals })} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setCreateOpen(false); setForm(emptyForm); }}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!form.title || !form.content || createNotice.isPending}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {error ? (
        <EmptyState icon={Megaphone} title="Erro ao carregar avisos" description="Não foi possível carregar os dados. Tente novamente." />
      ) : filteredNotices.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhum aviso cadastrado" description="Os comunicados da franqueadora aparecerão aqui." />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <Card className="col-span-1">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredNotices.map((a) => {
                  const tag = getTagInfo(a);
                  const isActive = selected?.id === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${isActive ? 'bg-accent border-l-2 border-l-primary' : 'hover:bg-muted/50'}`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? (tag.variant === 'red' ? 'bg-red-500' : tag.variant === 'yellow' ? 'bg-yellow-500' : 'bg-muted-foreground') : 'bg-transparent'}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${isActive ? 'font-semibold' : 'font-normal'}`}>{a.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {tag.variant && (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${tag.variant === 'red' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}`}>{tag.label}</span>
                          )}
                          <span className="text-[11px] text-muted-foreground">{formatDate(a.createdAt)}</span>
                        </div>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 overflow-hidden">
            <div className="flex h-56 items-center justify-center bg-primary">
              <div className="text-center">
                <Megaphone className="mx-auto h-12 w-12 text-white/40" />
                <p className="mt-2 text-2xl font-bold text-white/60">EVO</p>
              </div>
            </div>
            {selected && (
              <CardContent className="space-y-4 pt-6">
                {getTagInfo(selected).variant && (
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${getTagInfo(selected).variant === 'red' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}`}>
                    {getTagInfo(selected).label}
                  </span>
                )}
                <h2 className="text-xl font-bold">{selected.title}</h2>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(selected.createdAt)}</span>
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: selected.target === 'all' ? '#E8F5E9' : '#FFF8E1', color: selected.target === 'all' ? '#2E7D32' : '#F57F17' }}>{selected.target === 'all' ? 'Broadcast' : `${selected.target.split(',').length} unidade(s)`}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-2 text-sm text-muted-foreground whitespace-pre-line">{selected.content}</div>
                {canManage && (
                  <>
                    <div className="flex justify-end gap-2 pt-2">
                      <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger>
                          <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="h-3.5 w-3.5" /> Editar Aviso</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Editar Aviso</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="edit-title">Título</Label>
                              <Input id="edit-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="edit-content">Conteúdo</Label>
                              <Textarea id="edit-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-[120px]" />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={form.important} onChange={(e) => setForm({ ...form, important: e.target.checked })} className="rounded" />
                              Marcar como importante
                            </label>
                            <FranchisePicker selected={form.targets} onChange={(vals) => setForm({ ...form, targets: vals })} />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                            <Button onClick={handleEdit} disabled={!form.title || !form.content || updateNotice.isPending}>Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="gap-1.5 border-red-200 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => handleDelete(selected.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
