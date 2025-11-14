import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const RATE_LIMIT_TIME = 20000; // 20 seconds
const userRequestTimestamps = new Map();

// MASTER PROMPT (with custom prompt applied)
const PROMPT = `Generate a Learning Course using the following information:
1. COURSE NAME provided by the user.
2. Complete CHAPTER-WISE SYLLABUS or topics list pasted by the user.
3. A CUSTOM PROMPT provided by the user that MUST be applied while generating the course.

Your task:
Convert the provided course name, syllabus, and custom prompt into a structured learning course.

ALWAYS FOLLOW THE CUSTOM PROMPT EXACTLY. 
If the user has given special instructions (tone, examples, formats, strict rules, teaching style, etc.),
you MUST follow them.

Make sure to include:
- course_name (use exactly the name entered by the user),
- course_description,
- category,
- difficulty,
- chapters_number,
- include_videos,
- bannerImagePrompt (3D style),
- chapters with:
    - chapterName
    - duration
    - topics (list)

IMPORTANT RULES:
- The user may paste raw, unstructured syllabus content (numbered points, long text, formulas, etc.).
  You MUST convert that syllabus into clean JSON chapters.
- If the syllabus contains multiple chapters, detect them automatically.
- If the syllabus is a single block of text, intelligently split it into logical chapters.
- CUSTOM PROMPT MUST influence the structure, style, complexity, and wording of the generated content.
- NEVER add explanations, warnings, or extra text around the JSON.
- ALWAYS return ONLY valid JSON exactly in this format:

{
  "course": {
    "course_name": "string",
    "course_description": "string",
    "category": "string",
    "difficulty": "string",
    "include_videos": "boolean",
    "chapters_number": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": ["string"]
      }
    ]
  }
}

User Input:
`;

function rateLimit(userId) {
  const now = Date.now();
  if (userRequestTimestamps.has(userId)) {
    const lastReq = userRequestTimestamps.get(userId);
    if (now - lastReq < RATE_LIMIT_TIME) {
      throw new Error("You're doing it too fast. Please wait and try again.");
    }
  }
  userRequestTimestamps.set(userId, now);
}

async function safeGeminiCall(ai, model, config, contents, retries = 2) {
  try {
    return await ai.models.generateContent({ model, config, contents });
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      console.warn("Gemini Rate Limit hit! Retrying in 5s...");
      await new Promise((res) => setTimeout(res, 5000));
      return safeGeminiCall(ai, model, config, contents, retries - 1);
    }
    throw error;
  }
}

export async function POST(req) {
  try {
    const formData = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check
    rateLimit(user.id);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const contents = [
      {
        role: "user",
        parts: [{ text: PROMPT + JSON.stringify(formData) }],
      },
    ];

    const response = await safeGeminiCall(
      ai,
      "gemini-flash-latest",
      { responseModalities: ["TEXT"] },
      contents
    );

    let rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    rawText = rawText.replace(/```json|```/g, "").trim();

    let jsonResp;
    try {
      jsonResp = JSON.parse(rawText);
    } catch (e) {
      console.error("JSON PARSE ERROR:", rawText);
      throw new Error("AI response was not valid JSON");
    }

    const imagePrompt =
      jsonResp?.course?.bannerImagePrompt ||
      "3D abstract futuristic course banner";

    const imageUrl = await generateImage(imagePrompt);

    // INSERT COURSE WITH isSemesterCourse = true
    await db.insert(coursesTable).values({
      cid: formData.courseId,
      course_name: formData.course_name,
      course_description: jsonResp.course.course_description,
      chapters_number: jsonResp.course.chapters_number,
      include_videos: jsonResp.course.include_videos,
      difficulty: jsonResp.course.difficulty ?? "semester",
      category: jsonResp.course.category ?? "Semester Course",
      courseJson: jsonResp,
      bannerImageUrl: imageUrl,
      courseContent: {},
      userEmail: user?.primaryEmailAddress?.emailAddress,
      isSemesterCourse: true,
    });

    return NextResponse.json({
      success: true,
      courseId: formData.courseId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function generateImage(prompt) {
  try {
    const encoded = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&model=flux&seed=${Date.now()}`;
  } catch {
    return null;
  }
}
