'use client'; // Так как используем хуки React в Next.js 13+

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback, // Added useCallback
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

// Описываем тип пользователя (можно дополнить/изменить по своему вкусу)
interface User {
  email: string;
  uuid: string;
  paidUntil: string | null; // у тебя может быть null
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  fetchUser: () => Promise<void>;
}

// Создаем сам контекст
const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
  fetchUser: async () => {},
});

// Провайдер, который будем оборачивать вокруг всего приложения (Layout и т.д.)
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // При первом рендере проверяем токен в localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Функция для получения юзера с сервера
  const fetchUser = useCallback(async () => {
    try {
      if (!token) return;
      setLoading(true);

      const res = await fetch('/api/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Не удалось получить данные пользователя');
      }

      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error);
      // Можно сразу делать signOut() или обработать как-то иначе
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Выход (логаут)
  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  // Как только меняется `token`, если он есть — пробуем подгрузить юзера
  useEffect(() => {
    if (token) {
      fetchUser().catch(err => {
        console.error('Ошибка при загрузке пользователя:', err);
        signOut(); // если ошиблись, выходим
      });
    } else {
      setUser(null);
    }
  }, [token, fetchUser, signOut]);

  // Авторизация (логин)
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(errorBody.error || 'Ошибка при авторизации');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      setToken(data.token); // это вызовет useEffect и fetchUser

      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать!',
      });

      // Можно сразу редиректнуть, например, на /dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Ошибка при входе:', error);
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Ошибка входа',
          description: error.message || 'Неверный логин или пароль',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка входа',
          description: 'Произошла непредвиденная ошибка. Попробуйте ещё раз.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    signIn,
    signOut,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Хук, чтобы проще было доставать данные из контекста
export function useAuth() {
  return useContext(AuthContext);
}
