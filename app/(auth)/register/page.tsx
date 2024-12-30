// app/register/page.tsx

'use client';

import { FormEvent, useState } from 'react';
import { useRedirect } from '@/hooks/useRedirect';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  // Пользователь не должен быть аутентифицирован для доступа к странице регистрации
  useRedirect(false, '/dashboard');

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretToken, setSecretToken] = useState('');
  const [tokenError, setTokenError] = useState('');

  // Функция валидации секретного токена
  const validateSecretToken = (token: string): boolean => {
    const secretTokenPattern = /^[A-Za-z0-9]{10,}$/; // Пример: Алфавитно-цифровой, минимум 10 символов
    return secretTokenPattern.test(token);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    // Сброс предыдущей ошибки
    setTokenError('');

    // Валидация секретного токена
    if (!validateSecretToken(secretToken)) {
      setTokenError(
        'Секретный токен должен содержать не менее 10 алфавитно-цифровых символов.'
      );
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, secretToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка при регистрации');
      }
      toast({
        title: 'Успех!',
        description: 'Вы успешно зарегистрированы',
      });
      router.push('/login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: error.message || 'Попробуйте ещё раз',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Произошла непредвиденная ошибка. Попробуйте ещё раз.',
        });
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Введите ваш email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите ваш пароль"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {/* Новое поле для секретного токена */}
              <div>
                <Label htmlFor="secretToken">Секретный токен</Label>
                <Input
                  id="secretToken"
                  type="text"
                  placeholder="Введите секретный токен"
                  value={secretToken}
                  onChange={e => setSecretToken(e.target.value)}
                  required
                  aria-invalid={!!tokenError}
                  aria-describedby="secretToken-error"
                />
                {tokenError && (
                  <p
                    id="secretToken-error"
                    className="mt-1 text-sm text-red-500"
                  >
                    {tokenError}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Зарегистрироваться
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
