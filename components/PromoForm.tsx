// app/components/PaymentForm.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';

const PromoForm = () => {
  const { token } = useAuth(); // Получаем токен из контекста
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Промокод не может быть пустым.',
      });
      return;
    }

    setIsApplying(true);

    try {
      const res = await fetch('/api/promo/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Добавляем заголовок Authorization
        },
        body: JSON.stringify({ promoCode }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        setPromoCode('');
        // Опционально: обновите данные пользователя, чтобы отобразить новую подписку
      } else {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: data.message || 'Не удалось применить промокод.',
        });
      }
    } catch (error) {
      console.error('Ошибка при применении промокода:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Произошла ошибка при применении промокода.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Введите промокод"
        value={promoCode}
        onChange={e => setPromoCode(e.target.value)}
        disabled={isApplying}
      />
      <Button onClick={handleApplyPromo} disabled={isApplying}>
        {isApplying ? 'Применение...' : 'Применить'}
      </Button>
    </div>
  );
};

export default PromoForm;
