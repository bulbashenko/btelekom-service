// app/components/PaymentForm.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const PaymentForm = () => {
  const { token } = useAuth(); // Получаем токен из контекста
  const [loading, setLoading] = useState<boolean>(false);

  // Фиксированные суммы
  const fixedAmountDue = 250.0;
  const fixedSum = 269.77;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Добавляем заголовок Authorization
        },
        body: JSON.stringify({ amount_due: fixedAmountDue }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Не удалось создать платеж');
      }

      const data = await res.json();
      const { paymentUrl } = data;

      if (paymentUrl) {
        // Перенаправляем пользователя на страницу оплаты YooMoney
        window.location.href = paymentUrl;
      } else {
        throw new Error('Payment URL not found');
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error.message || 'Не удалось инициировать оплату',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Фиксированная сумма к списанию */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Стоимость (₽)
        </label>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          {fixedSum.toFixed(2)} ₽
        </p>
      </div>

      {/* Кнопка оплаты */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Оплата...' : 'Оплатить'}
      </Button>
    </form>
  );
};

export default PaymentForm;
