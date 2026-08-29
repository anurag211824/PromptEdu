import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { invokeLlmJson } from "@/lib/llm";

export const maxDuration = 30;

const PROMPT = `You write short course descriptions for an online learning platform.

Given a course name (and optionally a difficulty and category), write 3 DIFFERENT
one-or-two sentence descriptions a learner would see before enrolling.

Return ONLY valid JSON in this exact shape, no markdown fence and no commentary:
{ "suggestions": ["string", "string", "string"] }

Rules:
- 20-35 words each. No more.
- Each suggestion must take a genuinely different angle, for example:
  one focused on what the learner will be able to DO afterwards,
  one focused on the topics and ground the course covers,
  one focused on who it is for and why it matters.
- Write in plain, direct language. Second person ("you") is fine.
- Do not repeat the course name at the start of every suggestion.
- No marketing hype, no exclamation marks, no emoji, no quotes around the text.

Course details:
`;

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseName, difficulty, category } = await req.json();

    if (!courseName || courseName.trim().length < 3) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const details = JSON.stringify({
      course_name: courseName.trim(),
      ...(difficulty ? { difficulty } : {}),
      ...(category ? { category } : {}),
    });

    const result = await invokeLlmJson(PROMPT + details);

    const suggestions = (Array.isArray(result?.suggestions) ? result.suggestions : [])
      .filter((s) => typeof s === "string" && s.trim())
      .map((s) => s.trim())
      .slice(0, 3);

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("suggest-description failed:", error);
    // Suggestions are a convenience - never block course creation over them.
    return NextResponse.json(
      { success: false, suggestions: [], error: error?.message },
      { status: 200 }
    );
  }
}
