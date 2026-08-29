import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { invokeLlmJson } from "@/lib/llm";

export const maxDuration = 60;

const QUESTION_COUNT = 10;

const PROMPT = `You are writing a multiple-choice quiz to test a learner's understanding
of ONE topic they have just studied.

Return ONLY valid JSON in this exact shape — no markdown fence, no commentary:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}

Rules:
- Write exactly ${QUESTION_COUNT} questions.
- Every question must have exactly 4 options, and exactly one correct answer.
- "correctIndex" is the 0-based index of the correct option. Vary it across the
  quiz — do not make the answer the same position every time.
- Base the questions ONLY on the topic material provided. Do not test facts the
  material does not cover.
- Mix difficulty: roughly 4 recall questions, 4 applying the concept, and 2 that
  require reasoning about a small code snippet or scenario.
- Make the wrong options plausible — common misconceptions, not obvious filler.
- Keep each question under 30 words and each option under 15 words.
- "explanation" is one sentence saying why the correct answer is right.
- Do not number the questions or reference "the text" / "the material".

Topic material:
`;

/** AI lesson content is HTML; the model only needs the prose. */
function stripHtml(html) {
  if (typeof html !== "string") return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Discards anything malformed so the UI never renders a broken question. */
function sanitize(questions) {
  return (Array.isArray(questions) ? questions : [])
    .filter(
      (q) =>
        q &&
        typeof q.question === "string" &&
        q.question.trim() &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((o) => typeof o === "string" && o.trim()) &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex < 4
    )
    .map((q) => ({
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctIndex: q.correctIndex,
      explanation: typeof q.explanation === "string" ? q.explanation.trim() : "",
    }))
    .slice(0, QUESTION_COUNT);
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, chapterIndex, topicIndex } = await req.json();
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "A courseId is required." },
        { status: 400 }
      );
    }

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, courseId));

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found." },
        { status: 404 }
      );
    }

    const content = Array.isArray(course.courseContent) ? course.courseContent : [];
    const chapter = content[Number(chapterIndex)]?.courseData;
    const topic = chapter?.topics?.[Number(topicIndex)];

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "That topic could not be found." },
        { status: 404 }
      );
    }

    const material = stripHtml(topic.content);
    if (material.length < 80) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This topic has no lesson content yet, so a quiz can't be built from it.",
        },
        { status: 400 }
      );
    }

    const details = JSON.stringify({
      chapter: chapter?.chapterName,
      topic: topic.topic,
      material,
    });

    const result = await invokeLlmJson(PROMPT + details);
    const questions = sanitize(result?.questions);

    if (questions.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not build a quiz right now. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      topic: topic.topic,
      chapterName: chapter?.chapterName,
      questions,
    });
  } catch (error) {
    console.error("generate-quiz failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Quiz generation failed." },
      { status: 500 }
    );
  }
}
