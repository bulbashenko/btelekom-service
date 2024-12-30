// app/payments/page.tsx
/* eslint-disable */

'use client';

import { useAuth } from '@/context/AuthContext';
import { useRedirect } from '@/hooks/useRedirect';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface Payment {
  id: number;
  paymentId: string;
  userId: number;
  amount: number;
  label: string;
  status: string;
  createdAt: string;
}

const PaymentsPage = () => {
  const { user, token, loading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchPayments = async () => {
    setLoadingPayments(true);
    setError('');
    try {
      const res = await fetch('/api/get-payments', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Не удалось получить платежи');
      }
      const data = await res.json();
      setPayments(data.payments);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
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
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            История платежей
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={fetchPayments} className="mb-4">
            {loadingPayments ? 'Загрузка...' : 'Обновить'}
          </Button>
          {error && <p className="text-red-500">Ошибка: {error}</p>}
          {payments.length === 0 && !loadingPayments && <p>Нет платежей.</p>}
          {payments.length > 0 && (
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Сумма</th>
                  <th className="px-4 py-2">Статус</th>
                  <th className="px-4 py-2">Дата</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id} className="text-center">
                    <td className="border px-4 py-2">{payment.paymentId}</td>
                    <td className="border px-4 py-2">{payment.amount} ₽</td>
                    <td className="border px-4 py-2">{payment.status}</td>
                    <td className="border px-4 py-2">
                      {new Date(payment.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsPage;
