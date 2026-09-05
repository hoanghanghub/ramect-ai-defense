import { GoogleGenerativeAI } from "@google/generative-ai";

// Hàm phân tích Socratic (Dùng cho cả chế độ chọn Case và chế độ Quét tự do)
export async function processSocraticAnalysis(studentInput, newsContext, imageBase64 = null, caseId = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Thiếu GEMINI_API_KEY trong file .env.local");

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Xử lý trường hợp quét tự do (Free Scan)
    const isFreeScan = !caseId || caseId === "FREE_SCAN";
    const contextText = isFreeScan 
      ? `The user has provided the following media content (text, link, or image) they found online: "${newsContext}". Analyze this content as is.`
      : `Target Case Context: "${newsContext}"`;

    const prompt = `
    You are the RAMECT AI Media Defense & Cognitive Diagnostic Coach.
    
    ${contextText}
    Student's Reasoning / Action Input: "${studentInput}"
    
    ${imageBase64 ? "The user has provided an image. Analyze the content in the image for any fake news, manipulation, or traps." : ""}

    You MUST be strict and objective in grading. Do not inflate scores to make the student feel good.

    Rubric (0-100 scale):
    - PAR (Perception Accuracy Rate): Score HIGH (70-90) if they accurately identify the deception. Score LOW (40-60) if they are confused or vague.
    - PER (Pattern Exploitation Resistance): Score HIGH (70-90) if they clearly identify the manipulation technique. Score LOW (40-60) if they just say "it is fake" without proof.
    - TRR (Trapped Risk Rate): Score LOW (10-40) if they were calm and resistant. Score HIGH (80-95) if they were easily fooled.
    - CAR (Critical Analysis Rate): Score HIGH (70-90) if they provide strong critical reasoning. Score LOW (30-50) if they lack depth.
    
    Tasks:
    1. Identify cognitive biases or media manipulation traps.
    2. Apply the Rubric strictly to score the 4 indicators. 
    3. Generate 1 concise Socratic question.

    RETURN STRICT JSON ONLY:
    {
      "bias_detected": "Detected Bias / Trap Name",
      "analysis": "Short 2-sentence analysis",
      "socratic_question": "Socratic reflection question",
      "scores": { "PAR": 75, "PER": 70, "TRR": 30, "CAR": 80 }
    }
    `;

    const result = imageBase64 
      ? await model.generateContent([
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
        ])
      : await model.generateContent(prompt);

    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);

  } catch (err) {
    console.error("AI Error:", err);
    throw new Error(`Lỗi gọi Gemini AI: ${err.message || 'Key không hợp lệ hoặc hết hạn'}`);
  }
}

// Hàm chat Socratic (Dùng cho trang Coach - Đã thêm để tránh lỗi Build trên Vercel)
export async function processCoachReply(userMessage, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Thiếu GEMINI_API_KEY trong file .env.local");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.6-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const historyContext = history.map(msg => 
    `${msg.role === 'user' ? 'Student' : 'Coach'}: ${msg.content}`
  ).join('\n');

  const prompt = `
    You are a Socratic Coach. Your goal is to guide the student to think critically about media using the Socratic method.
    
    ${historyContext ? `Conversation so far:\n${historyContext}\n` : ''}
    Student's latest message: "${userMessage}"

    Rules:
    - Do not give direct answers immediately.
    - Ask 1 short, probing question back to the student.
    - Keep your response under 100 words.
    
    RETURN STRICT JSON ONLY:
    {
      "reply": "Your response here"
    }
  `;

  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}