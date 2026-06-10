import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { loginWithEmail, logoutUser, registerUser, onAuthChange } from '@/services/authService';
import type { User, Role } from '@/types';

interface AuthContextType {
  user: User | null;
  isApproved: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@evo.com', role: 'admin' as Role, active: true, approved: true },
  { id: '2', name: 'Unidade Centro', email: 'centro@evo.com', role: 'franchise' as Role, unitId: 'unit-1', active: true, approved: true },
  { id: '3', name: 'Operacional User', email: 'operacional@evo.com', role: 'operacional' as Role, active: true, approved: true },
  { id: '4', name: 'Expansao User', email: 'expansao@evo.com', role: 'expansao' as Role, active: true, approved: true },
];

function findMockUser(email: string): User {
  const key = email.split('@')[0];
  return mockUsers.find((u) => u.email.startsWith(key)) ?? mockUsers[0];
}

const hasFirebaseConfig = true;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasFirebaseConfig) {
      const unsub = onAuthChange((fbUser) => {
        setUser(fbUser);
        setLoading(false);
      });
      return () => unsub();
    } else {
      setUser(mockUsers[0]);
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (hasFirebaseConfig) {
      const u = await loginWithEmail(email, password);
      setUser(u);
    } else {
      setUser(findMockUser(email));
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    if (hasFirebaseConfig) {
      const u = await registerUser(email, password, name);
      setUser(u);
      return u;
    }
    const mock = findMockUser(email);
    setUser(mock);
    return mock;
  }, []);

  const logout = useCallback(async () => {
    if (hasFirebaseConfig) {
      await logoutUser();
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isApproved: user?.approved ?? false, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
