// app/api/user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure the path is correct
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string; // Keeping as string for initial decoding
  email: string;
  iat: number;
  exp: number;
}

export async function GET(req: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or malformed' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const SECRET = process.env.JWT_SECRET;

    if (!SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Verify the token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, SECRET) as JwtPayload;
    } catch (err) {
      console.error('Invalid token:', err);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Convert userId to number
    const userIdNumber = parseInt(decoded.userId, 10);

    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber }, // Use the converted number
      select: {
        email: true,
        uuid: true,
        paidUntil: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in /api/user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
