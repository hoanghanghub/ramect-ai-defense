import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processSocraticAnalysis } from '@/lib/aiEngine';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { studentId, studentInput, newsContext, caseId, roundNumber, imageBase64 } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Lỗi cấu hình server Supabase" }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gọi AI (Truyền cả caseId xuống, nếu không có thì là null để AI hiểu là quét tự do)
    let aiData;
    try {
      aiData = await processSocraticAnalysis(studentInput, newsContext, imageBase64, caseId || null);
    } catch (aiErr) {
      console.error("Lỗi AI Engine:", aiErr);
      return NextResponse.json({ error: aiErr.message || "Lỗi AI Engine" }, { status: 500 });
    }

    if (!aiData || !aiData.scores) {
      return NextResponse.json({ error: "AI trả về dữ liệu không hợp lệ" }, { status: 500 });
    }

    // Lưu vào game_rounds (case_id sẽ là "FREE_SCAN" nếu không có case)
    const { error: dbError } = await supabase.from('game_rounds').insert({
      student_id: studentId,
      round_number: roundNumber || 1,
      case_id: caseId || "FREE_SCAN", 
      action_taken: studentInput,
      par: aiData.scores.PAR / 100,
      per: aiData.scores.PER / 100,
      trr: aiData.scores.TRR / 100,
      car: aiData.scores.CAR / 100,
      total_score: Math.round((aiData.scores.PAR + aiData.scores.PER + aiData.scores.CAR - aiData.scores.TRR) / 3 * 10)
    });
    if (dbError) console.error("Lỗi lưu game_rounds:", dbError);

    // Lưu lịch sử
    const { data: existingProfile } = await supabase
      .from('user_cognitive_profiles')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (!existingProfile) {
      return NextResponse.json({ error: "Tài khoản chưa tồn tại. Vui lòng đăng ký trước!" }, { status: 400 });
    }

    const newScoreEntry = {
      case_id: caseId || "FREE_SCAN",
      date: new Date().toISOString(),
      scores: aiData.scores
    };

    const newQuestionEntry = {
      case_id: caseId || "FREE_SCAN",
      date: new Date().toISOString(),
      question: aiData.socratic_question
    };

    await supabase
      .from('user_cognitive_profiles')
      .update({
        history_scores: [...(existingProfile.history_scores || []), newScoreEntry],
        socratic_questions: [...(existingProfile.socratic_questions || []), newQuestionEntry]
      })
      .eq('student_id', studentId);

    return NextResponse.json({ success: true, data: aiData });
  } catch (e) {
    console.error("Lỗi nghiêm trọng tại /api/analyze:", e);
    return NextResponse.json({ error: e.message || "Lỗi hệ thống" }, { status: 500 });
  }
}