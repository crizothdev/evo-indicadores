import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/roles';
import { useAppointments, useCreateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { useUnits } from '@/hooks/useUnits';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ChevronLeft, ChevronRight, Building2, Trash2, Loader2, CalendarDays } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Role } from '@/types';

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const typeColors: Record<string, string> = {
  reuniao: '#DC3545',
  suporte: '#007BFF',
  checkin: '#28A745',
};
const typeLabels: Record<string, string> = {
  reuniao: 'Reunião',
  suporte: 'Suporte',
  checkin: 'Check-in',
};

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | '')[][] = [];
  let week: (number | '')[] = [];
  for (let i = 0; i < first; i++) week.push('');
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(''); weeks.push(week); }
  return weeks;
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const today = new Date();

export default function AgendaPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const canManage = hasPermission(role, 'canManageAgenda');
  const canRequest = hasPermission(role, 'canRequestAppointment');
  const { data: appointments = [], isLoading, error } = useAppointments();
  const { data: units = [] } = useUnits();
  const createAppointment = useCreateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: formatDateInput(today), time: '09:00', type: 'reuniao', unitId: '', unitName: '' });

  const calendar = useMemo(() => buildCalendar(currentYear, currentMonth), [currentYear, currentMonth]);
  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const dayAppointments = appointments.filter((a) => a.date === selectedDateStr);

  const eventDays = useMemo(() => {
    const set = new Set<number>();
    for (const a of appointments) {
      const [y, m, d] = a.date.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1) set.add(d);
    }
    return set;
  }, [appointments, currentYear, currentMonth]);

  const prevMonth = () => { if (currentMonth === 0) { setCurrentYear((y) => y - 1); setCurrentMonth(11); } else setCurrentMonth((m) => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentYear((y) => y + 1); setCurrentMonth(0); } else setCurrentMonth((m) => m + 1); };

  const handleCreate = () => {
    if (!form.title || !form.date) return;
    createAppointment.mutate({
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      type: form.type as 'reuniao' | 'suporte' | 'checkin',
      unitId: form.unitId,
      unitName: form.unitName || (units.find((u) => u.id === form.unitId)?.nomeFantasia ?? ''),
    });
    setForm({ title: '', description: '', date: formatDateInput(today), time: '09:00', type: 'reuniao', unitId: '', unitName: '' });
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este compromisso?')) deleteAppointment.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Agenda de Compromissos" description="Gerencie reuniões, suporte e visitas às unidades" />
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center">
        <p className="text-sm font-medium text-yellow-800">Módulo em desenvolvimento — Algumas funcionalidades podem estar indisponíveis</p>
      </div>

      <PageHeader title="Agenda de Compromissos" description="Gerencie reuniões, suporte e visitas às unidades">
        {canManage && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Novo Compromisso</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Compromisso</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ap-title">Título</Label>
                  <Input id="ap-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título do compromisso" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ap-desc">Descrição</Label>
                  <Textarea id="ap-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição..." className="min-h-[80px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ap-date">Data</Label>
                    <Input id="ap-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ap-time">Horário</Label>
                    <Input id="ap-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ap-type">Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? 'reuniao' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="suporte">Suporte</SelectItem>
                      <SelectItem value="checkin">Check-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ap-unit">Unidade</Label>
                  <Select value={form.unitId} onValueChange={(v) => setForm({ ...form, unitId: v ?? '', unitName: units.find((u) => u.id === (v ?? ''))?.nomeFantasia ?? '' })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.nomeFantasia}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!form.title || !form.date || createAppointment.isPending}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      {error ? (
        <EmptyState icon={CalendarDays} title="Erro ao carregar agenda" description="Não foi possível carregar os dados. Tente novamente." />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <Card className="col-span-1">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <button className="rounded-md p-1 hover:bg-muted" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-base font-bold capitalize">{monthLabel}</span>
                <button className="rounded-md p-1 hover:bg-muted" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-7 text-center">
                {weekDays.map((d) => (<div key={d} className="text-[11px] font-semibold text-muted-foreground py-1">{d}</div>))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calendar.flat().map((day, i) => {
                  const hasEvent = typeof day === 'number' && eventDays.has(day);
                  const isSelected = day === selectedDay;
                  const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                  return (
                    <button
                      key={i}
                      onClick={() => typeof day === 'number' && setSelectedDay(day)}
                      className={`aspect-square flex items-center justify-center rounded-md text-xs transition-colors ${
                        isSelected && !isToday ? 'bg-primary/20 text-primary font-bold' :
                        isToday ? 'bg-primary text-white font-bold' :
                        hasEvent ? 'bg-accent text-primary font-medium' :
                        day ? 'hover:bg-muted text-foreground' : 'text-transparent'
                      }`}
                      disabled={!day}
                    >
                      {day || ''}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" />Hoje</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent" />Compromissos</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Compromissos - {selectedDay} de {monthLabel}</CardTitle>
                <span className="text-xs text-muted-foreground">{dayAppointments.length} compromisso{dayAppointments.length !== 1 ? 's' : ''}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-0 pt-0">
              {dayAppointments.length === 0 ? (
                <div className="py-8">
                  <EmptyState className="border-none bg-transparent py-8" icon={CalendarDays} title="Nenhum compromisso" description="Nenhum compromisso agendado para este dia." />
                </div>
              ) : (
                dayAppointments.map((ap) => (
                  <div key={ap.id} className="flex items-start gap-3.5 border-b border-border py-3 last:border-0">
                    <div className="flex flex-col items-center w-14 shrink-0">
                      <span className="text-sm font-bold" style={{ color: typeColors[ap.type] ?? '#6C757D' }}>{ap.time}</span>
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold mt-0.5" style={{ backgroundColor: (typeColors[ap.type] ?? '#6C757D') + '15', color: typeColors[ap.type] ?? '#6C757D' }}>
                        {typeLabels[ap.type] ?? ap.type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-semibold">{ap.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" /> {ap.unitName}
                      </div>
                      {ap.description && <p className="text-xs text-muted-foreground">{ap.description}</p>}
                    </div>
                    {canManage && (
                      <div className="flex gap-1 shrink-0">
                        <button className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(ap.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {canRequest && (
                <div className="mt-4 space-y-3 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold">Solicitar Agendamento</h4>
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2.5 text-center">
                    <p className="text-xs font-medium text-yellow-700">Em desenvolvimento</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
