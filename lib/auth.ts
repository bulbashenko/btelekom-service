// lib/auth.ts
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export async function verifyAuth(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return null;
    }

    if (!SECRET) {
      throw new Error("JWT_SECRET is not defined. Set it in your environment variables.");
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, SECRET) as { userId: string };

    // Преобразование userId в число
    const userId = parseInt(payload.userId, 10);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID in token.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user || null;
  } catch (err) {
    console.error("Error in verifyAuth:", err);
    return null;
  }
}
