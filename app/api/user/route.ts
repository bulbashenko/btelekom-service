import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Если пользователь найден, вернём его
  return NextResponse.json({ user });
}
