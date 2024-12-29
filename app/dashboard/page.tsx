// app/dashboard/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRedirect } from '@/hooks/useRedirect';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function DashboardPage() {
  // Пользователь должен быть аутентифицирован для доступа к этой странице
  useRedirect(true, '/login');

  const { user, token, loading, signOut } = useAuth();

  const handleUpdateXUI = async () => {
    try {
      const res = await fetch('/api/update-xui', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Не удалось обновить x-ui');
      }
      const data = await res.json();
      toast({
        title: 'Успешно',
        description: data.message,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось обновить x-ui',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Загрузка...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Выход выполнен. Пожалуйста, войдите снова.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">Личный кабинет</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="break-all font-medium">{user.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">UUID:</span>
              <span className="break-all font-medium">{user.uuid}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Paid Until:</span>
              <span className="font-medium">{user.paidUntil}</span>
            </div>
          </div>
          <Button onClick={handleUpdateXUI} className="w-full">
            Обновить x-ui
          </Button>
          <Button
            variant="destructive"
            onClick={signOut}
            className="mt-4 w-full"
          >
            Выйти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
