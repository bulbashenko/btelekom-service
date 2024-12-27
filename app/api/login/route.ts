import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // или где у тебя prisma client
import { compare } from "bcrypt";     // bcrypt для сравнения
import jwt from "jsonwebtoken";       // или любая lib для JWT

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const SECRET = process.env.JWT_SECRET || "SUPERSECRET";

    // 1. Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Неверный логин/пароль" },
        { status: 401 }
      );
    }

    // 2. Проверяем пароль
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Неверный логин/пароль" },
        { status: 401 }
      );
    }

    // 3. Генерим JWT (на проде ключ храним в env)
    let token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET, // process.env.JWT_SECRET или другое
      { expiresIn: "7d" }
    );

    // 4. Возвращаем токен
    return NextResponse.json({ token });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Сбой при входе, попробуй ещё раз" },
      { status: 500 }
    );
  }
}
