import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getReadSource, setReadSource } from '@/services/dbConfig';
import { Database, Cloud } from 'lucide-react';

const sections = [
  {
    title: 'Acesso aos Dados',
    desc: 'Configure a origem dos dados e conexão com Firebase',
    fields: [],
  },
  {
    title: 'Parâmetros de Crescimento',
    desc: 'Configure a média de crescimento esperada e faixas de classificação',
    fields: ['Crescimento Mínimo Esperado: 10%', 'Crescimento Excelente Acima de: 25%', 'Faixa de Alerta: Abaixo de 5%'],
  },
  {
    title: 'Regras do TOP 5',
    desc: 'Defina os critérios para premiação mensal',
    fields: ['Crescimento Mínimo para TOP 5: 20%', 'Presença Mínima em Treinamentos: 75%', 'Validação de Redes Sociais: Obrigatória'],
  },
  {
    title: 'Períodos Analíticos',
    desc: 'Configure os períodos de análise dos indicadores',
    fields: ['Período de Comparação: Mês Anterior', 'Janela de Histórico: 12 meses', 'Atualização Automática: Ativada'],
  },
];

export default function ConfiguracoesPage() {
  const [readSource, setReadSource_] = useState(getReadSource);

  useEffect(() => {
    setReadSource_(getReadSource());
  }, []);

  const handleToggle = () => {
    const next = readSource === 'firebase' ? 'local' : 'firebase';
    setReadSource(next);
    setReadSource_(next);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Configurações do Sistema" description="Parametrização de regras e indicadores" />

      <div className="space-y-4">
        {sections.map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{s.title}</CardTitle><p className="text-xs text-muted-foreground">{s.desc}</p></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {s.title === 'Acesso aos Dados' ? (
                <>
                  <div className="flex items-center justify-between rounded-md bg-muted px-3.5 py-2.5 text-sm">
                    <span>Fonte de leitura</span>
                    <button
                      onClick={handleToggle}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                        readSource === 'firebase'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {readSource === 'firebase' ? (
                        <><Cloud className="h-3 w-3" /> Remoto</>
                      ) : (
                        <><Database className="h-3 w-3" /> Local</>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground px-1">
                    Dados salvos em ambos. Leitura remota (Firestore) por padrão.
                  </p>
                </>
              ) : (
                s.fields.map((f) => (
                  <div key={f} className="flex items-center justify-between rounded-md bg-muted px-3.5 py-2.5 text-sm">
                    <span>{f.split(':')[0]}</span>
                    <span className="font-semibold text-primary">{f.split(': ')[1]}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button>Salvar Configurações</Button>
      </div>
    </div>
  );
}
