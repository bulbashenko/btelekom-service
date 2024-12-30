// app/api/promo/apply/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/auth'; // Убедитесь, что путь правильный
import { prisma } from '@/lib/prisma'; // Убедитесь, что путь правильный

export async function POST(request: NextRequest) {
    // Получение сессии пользователя
    const session = await getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { promoCode } = await request.json();

  if (!promoCode) {
    return NextResponse.json({ message: 'Промокод обязателен.' }, { status: 400 });
  }

  try {
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode },
      include: { promoUsages: true },
    });

    if (!promo) {
      return NextResponse.json({ message: 'Неверный промокод.' }, { status: 400 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ message: 'Промокод не активен.' }, { status: 400 });
    }

    if (promo.expiration && new Date() > promo.expiration) {
      return NextResponse.json({ message: 'Срок действия промокода истек.' }, { status: 400 });
    }

    const usageCount = await prisma.promoUsage.count({
      where: { promoCodeId: promo.id },
    });

    if (usageCount >= promo.maxUses) {
      return NextResponse.json({ message: 'Лимит использования промокода достигнут.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден.' }, { status: 404 });
    }

    const existingUsage = await prisma.promoUsage.findUnique({
      where: {
        userId_promoCodeId: {
          userId: user.id,
          promoCodeId: promo.id,
        },
      },
    });

    if (existingUsage) {
      return NextResponse.json({ message: 'Вы уже использовали этот промокод.' }, { status: 400 });
    }

    // Применение промокода: добавление 15 дней к paidUntil
    const newPaidUntil = user.paidUntil
      ? new Date(user.paidUntil.getTime() + 15 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { paidUntil: newPaidUntil },
    });

    // Запись использования промокода
    await prisma.promoUsage.create({
      data: {
        userId: user.id,
        promoCodeId: promo.id,
      },
    });

    return NextResponse.json(
      { message: 'Промокод успешно применен. Вам добавлено 15 дней подписки.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при применении промокода:', error);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера.' }, { status: 500 });
  }
}
