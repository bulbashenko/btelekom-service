// pages/api/register.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Инициализация Prisma
import { hash } from 'bcrypt'; // bcrypt
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { email, password, secretToken } = await req.json();

    // Проверка наличия всех полей
    if (!email || !password || !secretToken) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Нормализация email
    const normalizedEmail = email.trim().toLowerCase();

    // Валидация формата email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Неверный формат email' },
        { status: 400 }
      );
    }

    // Валидация секретного токена
    const VALID_SECRET_TOKEN = process.env.SECRET_REGISTRATION_TOKEN;

    if (!VALID_SECRET_TOKEN) {
      console.error('SECRET_REGISTRATION_TOKEN is not defined in environment variables.');
      return NextResponse.json(
        { error: 'Серверная ошибка' },
        { status: 500 }
      );
    }

    if (secretToken !== VALID_SECRET_TOKEN) {
      return NextResponse.json(
        { error: 'Неверный секретный токен' },
        { status: 403 }
      );
    }

    // Проверка на существование пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email уже используется' },
        { status: 400 }
      );
    }

    // Валидация секретного токена по шаблону (опционально)
    const secretTokenPattern = /^[A-Za-z0-9]{10,}$/; // Пример: Алфавитно-цифровой, минимум 10 символов
    if (!secretTokenPattern.test(secretToken)) {
      return NextResponse.json(
        { error: 'Секретный токен имеет неверный формат' },
        { status: 400 }
      );
    }

    // Хэш пароля
    const hashedPassword = await hash(password, 10);

    // Генерируем UUID для VLESS
    const userUUID = uuidv4();

    // Создаём нового пользователя
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        uuid: userUUID,
        paidUntil: null, // Пока не оплачено
      },
    });

    return NextResponse.json({ success: true, message: 'Пользователь зарегистрирован успешно' });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    return NextResponse.json(
      { error: 'Произошла ошибка при регистрации' },
      { status: 500 }
    );
  }
}
