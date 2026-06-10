import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers, useUpdateUser } from '@/hooks/useUsers';
import { useUnits } from '@/hooks/useUnits';
import { usePendingUsers } from '@/hooks/usePendingUsers';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle2, Clock, Shield, Building2 } from 'lucide-react';
import type { Role, User } from '@/types';

const roleOptions: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'franchise', label: 'Franquia' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'expansao', label: 'Expansão' },
];

function ApproveDialog({ user, onApprove }: { user: User; onApprove: (data: { role: Role; unitId?: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>('franchise');
  const [unitId, setUnitId] = useState('');
  const { data: units } = useUnits();

  const handleConfirm = () => {
    onApprove({ role, unitId: unitId || undefined });
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)} style={{ padding: '6px 14px', color: '#fff' }}>
        <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Aprovar Usuário</h3>

            <div className="rounded-md bg-muted p-3 text-sm space-y-1 mb-4">
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Função</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {role === 'franchise' && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Unidade</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                >
                  <option value="">Selecionar unidade</option>
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>{u.nomeFantasia}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button className="gap-1.5" onClick={handleConfirm} style={{ padding: '8px 18px', color: '#fff' }}>
                <CheckCircle2 className="h-4 w-4" /> Confirmar Aprovação
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function UsuariosPage() {
  const { data: users, isLoading } = useUsers();
  const { data: pendingUsers } = usePendingUsers();
  const updateUser = useUpdateUser();
  const { user: currentUser } = useAuth();

  const handleApprove = (userId: string, data: { role: Role; unitId?: string }) => {
    updateUser.mutate({ id: userId, data: { ...data, approved: true } });
  };

  const allUsers = users ?? [];
  const pending = pendingUsers ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="Usuários da Plataforma">
        <Badge variant="outline" className="gap-1.5 text-sm">
          <Users className="h-4 w-4" /> {allUsers.length} total
        </Badge>
      </PageHeader>

      {pending.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-yellow-700">
              <Clock className="h-4 w-4" /> Pendentes ({pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 border-yellow-200 bg-yellow-50 text-yellow-700">
                        <Clock className="h-3 w-3" /> Pendente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ApproveDialog user={u} onApprove={(data) => handleApprove(u.id, data)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Todos os Usuários</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
          ) : allUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Users className="h-8 w-8" />
              <p className="text-sm">Nenhum usuário cadastrado</p>
              <p className="text-xs">Os usuários aparecerão aqui após se registrarem na plataforma.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" /> {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.unitId ? (
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {u.unitId}</span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.approved ? (
                        <Badge variant="default" className="gap-1 bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3" /> Aprovado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-yellow-200 bg-yellow-50 text-yellow-700">
                          <Clock className="h-3 w-3" /> Pendente
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
