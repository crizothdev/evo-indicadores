import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUnits } from '@/hooks/useUnits';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { FranchiseModal } from '@/components/shared/FranchiseModal';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Building2, Plus, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Role } from '@/types';

export default function UnidadesPage() {
  const { user } = useAuth();
  const role = (user?.role ?? 'admin') as Role;
  const { data: units = [], isLoading, error } = useUnits();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('growth-desc');

  const filtered = useMemo(() => {
    let list = [...units];

    if (statusFilter !== 'all') {
      list = list.filter((u) => u.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.razaoSocial.toLowerCase().includes(q) || u.nomeFantasia.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'growth-desc': return b.growth - a.growth;
        case 'growth-asc': return a.growth - b.growth;
        case 'engagement-desc': return b.engagement - a.engagement;
        case 'engagement-asc': return a.engagement - b.engagement;
        case 'ranking-asc': return a.ranking - b.ranking;
        case 'ranking-desc': return b.ranking - a.ranking;
        case 'tces-desc': return b.tces - a.tces;
        case 'tces-asc': return a.tces - b.tces;
        default: return 0;
      }
    });

    return list;
  }, [units, search, statusFilter, sortBy]);

  return (
    <div className="space-y-5">
      <PageHeader title="Todas as Unidades" description="Gerencie e analise cada franquia da rede">
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <FranchiseModal>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-4 w-4" /> Cadastrar Franquia
              </Button>
            </FranchiseModal>
          )}
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Exportar</Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <Input placeholder="Buscar unidade..." className="flex-1 max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Situação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Operacional">Operacional</SelectItem>
            <SelectItem value="Critica">Crítica</SelectItem>
            <SelectItem value="Em Acompanhamento">Em Acompanhamento</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? 'growth-desc')}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="growth-desc">Crescimento (maior)</SelectItem>
            <SelectItem value="growth-asc">Crescimento (menor)</SelectItem>
            <SelectItem value="engagement-desc">Engajamento (maior)</SelectItem>
            <SelectItem value="engagement-asc">Engajamento (menor)</SelectItem>
            <SelectItem value="ranking-asc">Ranking (melhor)</SelectItem>
            <SelectItem value="tces-desc">TCEs (maior)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <EmptyState icon={Building2} title="Erro ao carregar unidades" description="Não foi possível carregar os dados. Tente novamente." />
          ) : filtered.length === 0 ? (
            <EmptyState className="border-none rounded-none bg-transparent py-16" icon={Building2} title="Nenhuma unidade cadastrada" description="Importe dados CSV ou cadastre unidades manualmente para vê-las aqui." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">TCEs</TableHead>
                  <TableHead className="text-right">Crescimento</TableHead>
                  <TableHead className="text-right">Engajamento</TableHead>
                  <TableHead className="text-right">Ranking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((unit) => (
                  <TableRow key={unit.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link to={`/unidades/${unit.id}`} className="font-medium text-sm hover:text-primary">{unit.nomeFantasia}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{unit.razaoSocial}</TableCell>
                    <TableCell><StatusBadge status={unit.status} /></TableCell>
                    <TableCell className="text-right font-semibold">{unit.tces}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-semibold text-sm ${unit.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {unit.growth >= 0 ? '+' : ''}{unit.growth}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm">{unit.engagement}%</span>
                        <div className="h-1 w-10 rounded-full bg-muted">
                          <div className="h-1 rounded-full bg-green-500" style={{ width: `${unit.engagement}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={unit.ranking <= 5 ? 'default' : 'secondary'}>#{unit.ranking}</Badge>
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
