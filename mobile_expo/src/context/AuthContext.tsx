import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'admin' | 'tesorero' | 'diacono' | 'miembro';

export interface AuthUser {
  id: number;
  nombre: string;
  usuario: string;
  nivel: UserRole;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  canAccessAportes: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem('@adlanzarote_token');
        const savedUser = await AsyncStorage.getItem('@adlanzarote_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {}
      finally { setIsLoading(false); }
    })();
  }, []);

  const setAuth = async (authUser: AuthUser, authToken: string) => {
    await AsyncStorage.setItem('@adlanzarote_token', authToken);
    await AsyncStorage.setItem('@adlanzarote_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem('@adlanzarote_token');
    await AsyncStorage.removeItem('@adlanzarote_user');
    setToken(null);
    setUser(null);
  };

  const canAccessAportes = () =>
    user?.nivel === 'admin' || user?.nivel === 'tesorero';

  const isAdmin = () => user?.nivel === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setAuth, clearAuth, canAccessAportes, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
