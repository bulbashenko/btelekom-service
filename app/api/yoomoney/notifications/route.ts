// app/api/yoomoney/notifications/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // Проверка заголовка Content-Type
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return NextResponse.json(
      { error: 'Unsupported Content-Type' },
      { status: 400 }
    );
  }

  // Парсинг тела запроса
  const bodyText = await request.text();
  const params = new URLSearchParams(bodyText);

  // Извлечение всех параметров уведомления
  const notification = {
    notification_type: params.get('notification_type') || '',
    operation_id: params.get('operation_id') || '',
    amount: params.get('amount') || '',
    withdraw_amount: params.get('withdraw_amount') || '',
    currency: params.get('currency') || '',
    datetime: params.get('datetime') || '',
    sender: params.get('sender') || '',
    codepro: params.get('codepro') || '',
    label: params.get('label') || '',
    sha1_hash: params.get('sha1_hash') || '',
    test_notification: params.get('test_notification') || '',
    unaccepted: params.get('unaccepted') || '',
    lastname: params.get('lastname') || '',
    firstname: params.get('firstname') || '',
    fathersname: params.get('fathersname') || '',
    email: params.get('email') || '',
    phone: params.get('phone') || '',
    city: params.get('city') || '',
    street: params.get('street') || '',
    building: params.get('building') || '',
    suite: params.get('suite') || '',
    flat: params.get('flat') || '',
    zip: params.get('zip') || '',
  };

  // Извлечение секретного ключа из переменных окружения
  const notification_secret = process.env.YOOMONEY_NOTIFICATION_SECRET;
  if (!notification_secret) {
    console.error('Notification secret is not set.');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Формирование строки для хэширования
  const dataString = [
    notification.notification_type,
    notification.operation_id,
    notification.amount,
    notification.currency,
    notification.datetime,
    notification.sender,
    notification.codepro,
    notification_secret,
    notification.label,
  ].join('&');

  // Вычисление SHA-1 хэша
  const computedHash = crypto
    .createHash('sha1')
    .update(dataString, 'utf-8')
    .digest('hex');

  // Сравнение хэшей
  if (computedHash !== notification.sha1_hash) {
    console.warn('Invalid SHA-1 hash. Notification might be forged.');
    return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
  }

  // Проверка статуса перевода
  if (notification.unaccepted === 'true') {
    console.log(
      'Перевод еще не зачислен. Необходимо освободить место на счете.'
    );
    // Здесь можно добавить логику для обработки замороженных переводов
  } else {
    console.log('Уведомление успешно получено:', notification);

    // Обработка успешного платежа
    // Извлекаем userId и paymentId из label
    const [userIdStr, paymentId] = notification.label.split('_');
    const userId = parseInt(userIdStr, 10);

    if (!userId || !paymentId) {
      console.warn('Invalid label format.');
      return NextResponse.json(
        { error: 'Invalid label format' },
        { status: 400 }
      );
    }

    try {
      // Обновление пользователя: добавляем 30 дней к paidUntil
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.warn('User not found:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 400 });
      }

      const currentDate = new Date();
      let newPaidUntil: Date;

      if (user.paidUntil && user.paidUntil > currentDate) {
        newPaidUntil = new Date(user.paidUntil);
        newPaidUntil.setDate(newPaidUntil.getDate() + 30);
      } else {
        newPaidUntil = new Date();
        newPaidUntil.setDate(newPaidUntil.getDate() + 30);
      }

      await prisma.user.update({
        where: { id: userId },
        data: { paidUntil: newPaidUntil },
      });

      console.log(
        `User ${userId} paidUntil updated to ${newPaidUntil.toISOString()}`
      );

      // Обновление статуса платежа (если модель Payment создана)
      await prisma.payment.update({
        where: { paymentId },
        data: { status: 'completed' },
      });
    } catch (error) {
      console.error('Error updating user paidUntil:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

  // Ответ 200 OK
  return NextResponse.json({ status: 'OK' }, { status: 200 });
}
