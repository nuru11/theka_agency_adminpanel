import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authApi } from '../services/thiqaApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_ROLES: UserRole[] = ['superAdmin', 'officeAdmin', 'accountant', 'employee'];

function readStoredUser(): User | null {
  const token = localStorage.getItem('thiqa_token');
  const stored = localStorage.getItem('thiqa_user');
  if (!token || !stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as User;
    return parsed?.role && USER_ROLES.includes(parsed.role) ? parsed : null;
  } catch {
    return null;
  }
}

function clearStoredAuth() {
  localStorage.removeItem('thiqa_token');
  localStorage.removeItem('thiqa_user');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('thiqa_token');
    if (!token) {
      if (localStorage.getItem('thiqa_user')) {
        clearStoredAuth();
      }
      setUser(null);
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => {
        const nextUser = res.data.data;
        if (!nextUser?.role || !USER_ROLES.includes(nextUser.role)) {
          clearStoredAuth();
          setUser(null);
          return;
        }
        setUser(nextUser);
        localStorage.setItem('thiqa_user', JSON.stringify(nextUser));
      })
      .catch((err: { response?: { status?: number } }) => {
        if (err.response?.status === 401) {
          clearStoredAuth();
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    const { token, user: loggedInUser } = res.data.data;
    if (!loggedInUser?.role || !USER_ROLES.includes(loggedInUser.role)) {
      throw new Error('Invalid user role');
    }
    localStorage.setItem('thiqa_token', token);
    localStorage.setItem('thiqa_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    authApi.logout().catch(() => {});
  };

  const hasRole = (...roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
