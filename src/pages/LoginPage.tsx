import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import bgLogin from '@/assets/bg-login.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Conta não encontrada. Crie uma nova conta.');
      } else {
        setError('Email ou senha inválidos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4" style={{ backgroundImage: `url(${bgLogin})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Card className="relative z-10 w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1 text-center pb-0">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <h1 className="text-xl font-bold">Evo Indicadores</h1>
          <p className="text-sm text-muted-foreground">Painel de Inteligência Operacional</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className={error ? 'border-orange-400 focus-visible:border-orange-400 focus-visible:ring-orange-400/50' : ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={error ? 'border-orange-400 focus-visible:border-orange-400 focus-visible:ring-orange-400/50' : ''} />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-border text-primary" />
                <span className="text-muted-foreground">Lembrar-me</span>
              </label>
              <button type="button" className="text-sm font-medium text-primary hover:underline">Esqueceu a senha?</button>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-orange-50 p-3 text-sm text-orange-700 border border-orange-300">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/registrar" className="font-medium text-primary hover:underline">Criar conta</Link>
          </p>


        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">Evo Indicadores v1.0</p>
        </CardFooter>
      </Card>
    </div>
  );
}
