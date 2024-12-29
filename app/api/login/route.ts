import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";


export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const SECRET = process.env.JWT_SECRET;
    const normalizedEmail = email.trim().toLowerCase();

    if (!SECRET) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET,
      { expiresIn: "5m" }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Сбой при входе, попробуй ещё раз" },
      { status: 500 }
    );
  }
}
