import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Ép Next.js không cache dữ liệu (tránh lỗi trong lúc dev)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Thiếu key env trong .env.local");
      return NextResponse.json({ success: false, error: 'Thiếu key env' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // LƯU Ý QUAN TRỌNG: 
    // Hãy đảm bảo tên bảng 'case_bank' là chính xác 100% so với tên bảng bạn đã tạo trên Supabase.
    // Nếu bảng của bạn tên là 'cases' thì phải sửa thành .from('cases')
    const { data, error } = await supabase.from('case_bank').select('*');

    if (error) {
      // In lỗi chi tiết ra terminal VS Code
      console.error("Supabase Error:", error); 
      
      // Trả về 500 và kèm message chi tiết để frontend đọc được
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, cases: data || [] });
  } catch (err) {
    console.error("Unexpected Server Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}