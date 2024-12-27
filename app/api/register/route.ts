import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Инициализация Prisma
import { hash } from "bcrypt"; // bcrypt
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Проверка на существование
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already used" }, { status: 400 });
    }

    // Хэш пароля
    const hashedPassword = await hash(password, 10);

    // Генерируем UUID для VLESS
    const userUUID = uuidv4();

    // Создаём нового юзера
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        uuid: userUUID,
        paidUntil: null, // Пока не оплачено
      },
    });

    return NextResponse.json({ success: true, message: "User registered" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
