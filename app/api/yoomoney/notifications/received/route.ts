// app/api/yoomoney/notifications/received/route.ts

import { NextResponse } from 'next/server';
import { getNotifications } from '../../../../store';

export async function GET() {
  const notifications = getNotifications();
  return NextResponse.json({ notifications }, { status: 200 });
}
