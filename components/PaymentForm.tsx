// app/components/PaymentForm.tsx
/* eslint-disable */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const PaymentForm = () => {
  const { token } = useAuth(); // Получаем токен из контекста
  const [paymentType, setPaymentType] = useState<'PC' | 'AC'>('PC');
  const [amountDue, setAmountDue] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amountDue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Сумма должна быть больше нуля.',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Добавляем заголовок Authorization
        },
        body: JSON.stringify({ paymentType, amount_due: amountDue }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Не удалось создать платеж');
      }

      const html = await res.text();

      // Создаём временный элемент для отображения HTML формы
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      document.body.appendChild(tempDiv);

      // Найти форму и отправить её
      const form = tempDiv.querySelector('form');
      if (form) {
        form.submit();
      } else {
        throw new Error('Форма оплаты не найдена');
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

  // Функция для расчёта суммы с комиссией (для отображения пользователю)
  const calculateSum = (): string => {
    let sum: number;

    if (paymentType === 'PC') {
      sum = amountDue / 0.99;
    } else {
      sum = amountDue / 0.97;
    }

    return sum.toFixed(2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Тип оплаты
        </label>
        <div className="mt-1 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              value="PC"
              checked={paymentType === 'PC'}
              onChange={() => setPaymentType('PC')}
              className="form-radio"
            />
            <span className="ml-2">ЮMoney</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentType"
              value="AC"
              checked={paymentType === 'AC'}
              onChange={() => setPaymentType('AC')}
              className="form-radio"
            />
            <span className="ml-2">Банковской картой</span>
          </label>
        </div>
      </div>

      <div>
        <label
          htmlFor="amountDue"
          className="block text-sm font-medium text-gray-700"
        >
          Сумма к получению (₽)
        </label>
        <input
          type="number"
          id="amountDue"
          name="amountDue"
          value={amountDue}
          onChange={e => setAmountDue(parseFloat(e.target.value))}
          min="1"
          step="0.01"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <p className="text-sm text-gray-500">
          Сумма к списанию: <strong>{calculateSum()} ₽</strong> (с учётом
          комиссии)
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Оплата...' : 'Оплатить'}
      </Button>
    </form>
  );
};

export default PaymentForm;
