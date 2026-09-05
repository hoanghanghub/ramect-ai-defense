import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const { studentId } = await req.json();
        if (!studentId) {
            return NextResponse.json({ error: "Thiếu studentId" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Lấy dữ liệu từ bảng profile
        const { data: profile, error } = await supabase
            .from('user_cognitive_profiles')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        if (error) {
            console.error("Lỗi lấy profile:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!profile) {
            return NextResponse.json({ error: "Không tìm thấy hồ sơ!" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: profile });
    } catch (e) {
        console.error("Lỗi Profile API:", e);
        return NextResponse.json({ error: e.message || "Lỗi hệ thống" }, { status: 500 });
    }
}