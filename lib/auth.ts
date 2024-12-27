// lib/auth.ts

import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

/**
 * Секрет для подписи JWT
 * Лучше всего хранить это в переменной окружения: process.env.JWT_SECRET
 */
const SECRET = process.env.JWT_SECRET || "SUPERSECRET";

/**
 * Создаём JWT по ID пользователя (и/или другим данным).
 * expiresIn: "7d" — токен живёт 7 дней, меняй по вкусу.
 */
export function signToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, SECRET, { expiresIn: "7d" });
}

/**
 * Проверяем токен из заголовка Authorization: "Bearer <token>"
 * Если всё ок — возвращаем объект user из базы.
 * Если нет — возвращаем null.
 */
export async function verifyAuth(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return null;
    }

    // вытаскиваем сам токен
    const token = authHeader.replace("Bearer ", "");
    // декодируем
    const payload = jwt.verify(token, SECRET) as { userId: string };

    // ищем юзера по userId
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    return user || null;
  } catch (err) {
    // если jwt.verify вылетел в ошибку
    return null;
  }
}
