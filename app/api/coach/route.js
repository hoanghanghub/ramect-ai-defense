import { NextResponse } from 'next/server';
import { processCoachReply } from '@/lib/aiEngine';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { userMessage, history } = await req.json();

    if (!userMessage) {
      return NextResponse.json({ error: "Thiếu tin nhắn" }, { status: 400 });
    }

    const aiData = await processCoachReply(userMessage, history || []);
    return NextResponse.json({ success: true, data: aiData });

  } catch (e) {
    console.error("Lỗi Coach API:", e);
    return NextResponse.json({ error: e.message || "Lỗi hệ thống" }, { status: 500 });
  }
}