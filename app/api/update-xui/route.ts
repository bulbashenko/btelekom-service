// app/api/update-xui/route.ts

import { NextResponse } from "next/server";
import { updateXUI } from "@/utils/updateXUI";

export async function POST() {
  try {
    await updateXUI(); // запускаем синхронизацию
    return NextResponse.json({ success: true, message: "x-ui обновлён" });
  } catch (error) {
    console.error("Ошибка при обновлении x-ui:", error);
    return NextResponse.json(
      { error: "Не удалось обновить x-ui" },
      { status: 500 }
    );
  }
}

