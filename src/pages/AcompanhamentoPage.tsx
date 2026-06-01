import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Eye } from 'lucide-react';

export default function AcompanhamentoPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Unidades em Acompanhamento" description="Monitoramento estratégico de unidades críticas" />

      <EmptyState icon={Eye} title="Nenhuma unidade em acompanhamento" description="As unidades em monitoramento aparecerão aqui quando forem adicionadas." />
    </div>
  );
}
