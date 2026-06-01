import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from '@/hooks/useNotices';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, ChevronRight, Megaphone, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
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

type NoticeForm = { title: string; content: string; important: boolean };

const emptyForm: NoticeForm = { title: '', content: '', important: false };

export default function AvisosPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const { data: notices = [], isLoading, error } = useNotices();
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const deleteNotice = useDeleteNotice();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<NoticeForm>(emptyForm);

  const selected = notices.find((n) => n.id === selectedId) ?? notices[0];

  const canManage = hasPermission(role, 'canManageNotices');

  const handleCreate = () => {
    if (!form.title || !form.content) return;
    createNotice.mutate({ title: form.title, content: form.content, important: form.important, createdBy: user?.id ?? '', target: 'all' });
    setForm(emptyForm);
    setCreateOpen(false);
  };

  const handleEdit = () => {
    if (!form.title || !form.content || !selectedId) return;
    updateNotice.mutate({ id: selectedId, data: { title: form.title, content: form.content, important: form.important } });
    setForm(emptyForm);
    setEditOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aviso?')) {
      deleteNotice.mutate(id);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const openEdit = (notice: Notice) => {
    setForm({ title: notice.title, content: notice.content, important: notice.important });
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!form.title || !form.content || createNotice.isPending}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {error ? (
        <EmptyState icon={Megaphone} title="Erro ao carregar avisos" description="Não foi possível carregar os dados. Tente novamente." />
      ) : notices.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nenhum aviso cadastrado" description="Os comunicados da franqueadora aparecerão aqui." />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <Card className="col-span-1">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {notices.map((a) => {
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
                  <span>{formatDate(selected.createdAt)}</span><span>Admin</span><span>Todas as unidades</span>
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
