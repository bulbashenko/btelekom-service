// app/dashboard/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRedirect } from '@/hooks/useRedirect';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import PaymentForm from '@/components/PaymentForm';
import { useState, useEffect } from 'react';
import { generateVlessURI } from '@/utils/generateVlessURI';
import { Copy } from 'lucide-react';
import { useQRCode } from 'next-qrcode'; // Импортируем useQRCode из next-qrcode
import PromoForm from '@/components/PromoForm';

export default function DashboardPage() {
  // Пользователь должен быть аутентифицирован для доступа к этой странице
  useRedirect(true, '/login');

  const { user, token, loading, signOut } = useAuth();
  const [vlessURI, setVlessURI] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { Canvas } = useQRCode(); // Получаем компонент Canvas из useQRCode

  // Функция для обновления x-ui
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

  // Функция для генерации VLESS URI
  const handleGenerateVlessURI = () => {
    if (user && user.uuid && user.email) {
      const uri = generateVlessURI(user.uuid, user.email);
      setVlessURI(uri);
    } else {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось сгенерировать VLESS URI.',
      });
    }
  };

  // Функция для копирования VLESS URI в буфер обмена
  const handleCopyURI = () => {
    if (vlessURI) {
      navigator.clipboard.writeText(vlessURI);
      toast({
        title: 'Скопировано',
        description: 'VLESS URI был скопирован в буфер обмена.',
      });
    }
  };

  // Автоматическая генерация VLESS URI при загрузке страницы
  useEffect(() => {
    if (user && user.uuid && user.email) {
      setIsGenerating(true);
      handleGenerateVlessURI();
      setIsGenerating(false);
    }
  }, [user]);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-4xl bg-transparent shadow-none border-none">

        <CardContent>
          <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
            {/* Левая колонка: Информация о пользователе и действия */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Личный кабинет</CardTitle>
              </CardHeader>
              <CardContent>
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
                    <span className="font-medium">
                      {user.paidUntil
                        ? new Date(user.paidUntil).toLocaleDateString()
                        : 'Не оплачено'}
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <Button onClick={handleUpdateXUI} className="w-full">
                    Обновить x-ui
                  </Button>

                  {/* Удалена кнопка для генерации VLESS URI */}
                  <PromoForm />
                  <PaymentForm />

                  <Button variant="destructive" onClick={signOut} className="w-full">
                    Выйти
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Правая колонка: Подключение (VLESS URI и QR-код) */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Подключение</CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                    <span className="ml-4">Генерация...</span>
                  </div>
                ) : vlessURI ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">VLESS URI:</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyURI}
                        aria-label="Копировать URI"
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                    </div>
                    <textarea
                      className="w-full p-2 bg-white border rounded resize-none"
                      rows={3}
                      value={vlessURI}
                      readOnly
                    ></textarea>
                    <div className="mt-4 flex justify-center">
                      <Canvas
                        text={vlessURI}
                        options={{
                          errorCorrectionLevel: 'M',
                          margin: 3,
                          scale: 4,
                          width: 300,
                          color: {
                          },
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Не удалось сгенерировать VLESS URI.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
