// lib/auth.ts

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Session {
  user: {
    id: number;
    email: string;
    // другие поля
  };
}

export async function getSession(
  request: NextRequest
): Promise<Session | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        // другие поля
      },
    };
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}
