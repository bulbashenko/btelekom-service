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
    const { paymentType, amount_due } = body;

    // Валидация входных данных
    if (!paymentType || !amount_due) {
      return NextResponse.json(
        { error: 'Missing paymentType or amount_due' },
        { status: 400 }
      );
    }

    if (!['PC', 'AC'].includes(paymentType)) {
      return NextResponse.json(
        { error: 'Invalid paymentType' },
        { status: 400 }
      );
    }

    const userSession = await getSession(request);
    if (!userSession || !userSession.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userSession.user.id;

    // Расчёт суммы с комиссией
    let sum: number;
    let amountToReceive: number;

    if (paymentType === 'PC') {
      // Кошелек ЮMoney: Комиссия 1% от суммы к получению
      // Формула: sum = amount_due / (1 - 0.01)
      sum = parseFloat((amount_due / 0.99).toFixed(2));
      amountToReceive = parseFloat(amount_due.toFixed(2));
    } else {
      // Банковская карта: Комиссия 3% от суммы к списанию
      // Формула: amount_due = sum * (1 - 0.03) => sum = amount_due / 0.97
      sum = parseFloat((amount_due / 0.97).toFixed(2));
      amountToReceive = parseFloat((sum * 0.97).toFixed(2));
    }

    // Создание уникального идентификатора платежа
    const paymentId = uuidv4();

    // Формирование метки платежа, содержащей userId и paymentId
    const label = `${userId}_${paymentId}`;

    // Создание записи платежа в базе данных
    const payment = await prisma.payment.create({
      data: {
        paymentId,
        userId,
        amount: sum,
        label,
        status: 'pending',
      },
    });

    // Параметры оплаты для YooMoney
    const paymentParams: Record<string, string> = {
      receiver: '4100118944378028', // Замените на ваш номер кошелька ЮMoney
      'quickpay-form': 'button',
      paymentType: paymentType,
      sum: sum.toFixed(2),
      label: label,
      successURL: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, // URL после успешной оплаты
      failureURL: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, // URL при неудачной оплате
      comment: 'Subscription payment',
      'need-fio': 'false',
      'need-email': 'false',
      'need-phone': 'false',
      'need-address': 'false',
    };

    // Формирование формы для отправки на YooMoney
    const formHtml = `
      <form id="yoomoney-form" method="POST" action="https://yoomoney.ru/quickpay/confirm">
        ${Object.entries(paymentParams)
          .map(
            ([key, value]) =>
              `<input type="hidden" name="${key}" value="${value}" />`
          )
          .join('\n')}
        <button type="submit">Перейти к оплате</button>
      </form>
      <script>
        document.getElementById('yoomoney-form').submit();
      </script>
    `;

    return new NextResponse(formHtml, {
      headers: { 'Content-Type': 'text/html' },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
