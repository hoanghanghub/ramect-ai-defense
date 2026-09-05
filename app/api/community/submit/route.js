import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { title, bait_context, content_type, topic_group, student_id } = await req.json();

    if (!title || !bait_context) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ tiêu đề và nội dung!" }, { status: 400 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Luôn đặt trạng thái là 'pending' (chờ duyệt)
    const { data, error } = await supabase.from('case_bank').insert({
      title,
      bait_context,
      content_type: content_type || 'News',
      topic_group: topic_group || 'News',
      submitted_by: student_id || 'Anonymous',
      status: 'pending' 
    });

    if (error) {
      console.error("Lỗi submit case:", error);
      return NextResponse.json({ error: "Không thể gửi case. Thử lại!" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Gửi case thành công! Chờ chuyên gia duyệt." });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}