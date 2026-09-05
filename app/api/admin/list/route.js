import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Chỉ lấy các case có trạng thái 'pending' (chờ duyệt)
    const { data, error } = await supabase
      .from('case_bank')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error("Lỗi lấy danh sách:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, cases: data || [] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}