import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const { action, studentId, pin } = await req.json();

        if (!studentId || !pin) {
            return NextResponse.json({ error: 'Vui lòng nhập đầy đủ ID và PIN' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (action === 'register') {
            const { data: existing } = await supabase
                .from('user_cognitive_profiles')
                .select('*')
                .eq('student_id', studentId)
                .maybeSingle();

            // TH1: Tài khoản chưa tồn tại -> Tạo mới
            if (!existing) {
                const { error: insertError } = await supabase
                    .from('user_cognitive_profiles')
                    .insert({ student_id: studentId, pin: pin });

                if (insertError) {
                    console.error("Lỗi đăng ký:", insertError);
                    return NextResponse.json({ error: 'Không thể đăng ký. Thử lại!' }, { status: 500 });
                }

                return NextResponse.json({ success: true, message: 'Đăng ký thành công!' });
            }

            // TH2: Tài khoản đã tồn tại NHƯNG chưa có PIN (NULL) -> Cập nhật PIN mới
            if (existing && (!existing.pin || existing.pin === '')) {
                const { error: updateError } = await supabase
                    .from('user_cognitive_profiles')
                    .update({ pin: pin })
                    .eq('student_id', studentId);

                if (updateError) {
                    console.error("Lỗi cập nhật PIN:", updateError);
                    return NextResponse.json({ error: 'Không thể cập nhật PIN. Thử lại!' }, { status: 500 });
                }

                return NextResponse.json({ success: true, message: 'Tài khoản cũ đã được gán PIN thành công!' });
            }

            // TH3: Tài khoản đã tồn tại VÀ đã có PIN -> Báo trùng
            return NextResponse.json({ error: 'Mã sinh viên này đã tồn tại trên hệ thống!' }, { status: 400 });
        }

        if (action === 'login') {
            const { data: user } = await supabase
                .from('user_cognitive_profiles')
                .select('*')
                .eq('student_id', studentId)
                .maybeSingle();

            if (!user) {
                return NextResponse.json({ error: 'Mã sinh viên không tồn tại!' }, { status: 404 });
            }

            // Nếu user tồn tại nhưng chưa có pin (null)
            if (!user.pin) {
                return NextResponse.json({ error: 'Tài khoản chưa có PIN. Vui lòng bấm "Đăng ký" để gán PIN!' }, { status: 401 });
            }

            if (user.pin !== pin) {
                return NextResponse.json({ error: 'Sai PIN!' }, { status: 401 });
            }

            return NextResponse.json({ success: true, message: 'Đăng nhập thành công!', data: user });
        }

        return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });

    } catch (error) {
        console.error("Lỗi Auth API:", error);
        return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
    }
}