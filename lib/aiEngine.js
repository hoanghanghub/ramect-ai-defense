import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processSocraticAnalysis(studentInput, newsContext, imageBase64 = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu GEMINI_API_KEY trong file .env.local");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Cấu trúc prompt (giữ nguyên rubric)
    const prompt = `
    You are the RAMECT AI Media Defense & Cognitive Diagnostic Coach.
    
    Target Case Context: "${newsContext}"
    Student's Reasoning / Action Input: "${studentInput}"
    
    ${imageBase64 ? "The user has provided an image. Analyze the content in the image for any fake news, manipulation, or traps." : ""}

    You MUST be strict and objective in grading. Do not inflate scores to make the student feel good.

    Rubric (0-100 scale):
    - PAR (Perception Accuracy Rate): Score HIGH (70-90) if they accurately identify the deception. Score LOW (40-60) if they are confused or vague.
    - PER (Pattern Exploitation Resistance): Score HIGH (70-90) if they clearly identify the manipulation technique (e.g., Bandwagon, Out-of-context). Score LOW (40-60) if they just say "it is fake" without proof.
    - TRR (Trapped Risk Rate): Score LOW (10-40) if they were calm, skeptical, and resistant to the trap. Score HIGH (80-95) if they were easily fooled, emotional, or fell for the bait.
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
      "scores": { 
        "PAR": 75,
        "PER": 70,
        "TRR": 30,
        "CAR": 80
      }
    }
    `;

    // Nếu có ảnh, gửi kèm dữ liệu ảnh
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