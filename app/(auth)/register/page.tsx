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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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
      // Changed from 'any' to 'unknown'
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: error.message || 'Попробуйте ещё раз',
        });
      } else {
        // Handle cases where the error is not an instance of Error
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
