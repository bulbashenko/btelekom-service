import { NextResponse } from "next/server";
import { updateXRayConfig } from "@/utils/xray"; // где лежит твой код updateXRayConfig

export async function POST() {
  try {
    await updateXRayConfig();
    return NextResponse.json({ success: true, message: "XRay updated" });
  } catch (err) {
    console.error("Error updating XRay:", err);
    return NextResponse.json({ error: "Failed to update XRay" }, { status: 500 });
  }
}
