import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Relatórios e Exportações" description="Geração de análises e documentos executivos" />

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
        <p className="text-sm font-medium text-yellow-800">Módulo em desenvolvimento - Disponível em breve</p>
      </div>

      <EmptyState icon={FileText} title="Relatórios em desenvolvimento" description="Os relatórios estarão disponíveis em breve." />
    </div>
  );
}
