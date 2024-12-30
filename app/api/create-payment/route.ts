// app/api/create-payment/route.ts

/* eslint-disable */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount_due } = body;

    // Валидация входных данных
    const fixedAmountDue = 250.0;
    const fixedSum = 269.77;

    if (amount_due !== fixedAmountDue) {
      return NextResponse.json(
        { error: 'Invalid amount_due. Must be 250.00 ₽' },
        { status: 400 }
      );
    }

    const userSession = await getSession(request);
    if (!userSession || !userSession.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userSession.user.id;

    // Создание уникального идентификатора платежа
    const paymentId = uuidv4();

    // Формирование метки платежа, содержащей userId и paymentId
    const label = `${userId}_${paymentId}`;

    // Создание записи платежа в базе данных
    const payment = await prisma.payment.create({
      data: {
        paymentId,
        userId,
        amount: fixedSum,
        label,
        status: 'pending',
      },
    });

    // Параметры оплаты для YooMoney
    const paymentParams = new URLSearchParams({
      receiver: '4100118944378028', // Замените на ваш номер кошелька ЮMoney
      'quickpay-form': 'button',
      paymentType: 'PC', // Фиксированный тип оплаты
      sum: fixedSum.toFixed(2),
      label: label,
      successURL: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, // URL после успешной оплаты
      failureURL: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, // URL при неудачной оплате
      comment: 'Subscription payment',
      'need-fio': 'false',
      'need-email': 'false',
      'need-phone': 'false',
      'need-address': 'false',
    });

    // Формирование полного URL для оплаты
    const paymentUrl = `https://yoomoney.ru/quickpay/confirm?${paymentParams.toString()}`;

    // Возвращаем URL для перенаправления
    return NextResponse.json({ paymentUrl }, { status: 200 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
