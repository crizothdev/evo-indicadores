import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function RegistrarPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/aguardando-aprovacao', { replace: true });
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'Este email já está cadastrado' :
        err.code === 'auth/weak-password' ? 'Senha muito fraca' :
        err.code === 'auth/invalid-email' ? 'Email inválido' :
        err.code === 'auth/configuration-not-found' ? 'Erro de configuração do Firebase. Contate o administrador.' :
        'Erro ao criar conta. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-0 left-0 right-0 h-72 bg-primary" />
      <Card className="relative z-10 w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1 text-center pb-0">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <h1 className="text-xl font-bold">Criar Conta</h1>
          <p className="text-sm text-muted-foreground">Evo Indicadores — Plataforma de Franquias</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required className={error ? 'border-orange-400 focus-visible:border-orange-400 focus-visible:ring-orange-400/50' : ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className={error ? 'border-orange-400 focus-visible:border-orange-400 focus-visible:ring-orange-400/50' : ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className={error ? 'border-orange-400 focus-visible:border-orange-400 focus-visible:ring-orange-400/50' : ''} />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-orange-50 p-3 text-sm text-orange-700 border border-orange-300">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">Fazer login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
