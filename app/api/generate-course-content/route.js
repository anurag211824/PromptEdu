import { NextResponse } from "next/server";
import { coursesTable } from "@/config/schema";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { generateChapter, mapWithConcurrency } from "@/lib/courseGeneration";

// Generating a whole course is slow (one model call per chapter), so this route
// needs far longer than the default serverless timeout. 60s is the ceiling on
// Vercel's Hobby plan; raise it to 300 on Pro if large courses still time out.
export const maxDuration = 60;

// Chapters used to all fire at once, which tripped the provider's per-minute
// limit as soon as a course had more than a handful of them. A few at a time
// keeps inside the quota while still being much faster than going one by one.
// Retries and model fallback live in lib/llm.js.
const CONCURRENCY = 3;

export async function POST(req) {
  try {
    const { courseLayout, courseTitle, courseId } = await req.json();
    const chapters = courseLayout?.chapters;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        { success: false, error: "This course has no chapters to generate." },
        { status: 400 }
      );
    }

    const failures = [];

    const CourseContent = await mapWithConcurrency(
      chapters,
      CONCURRENCY,
      async (chapter) => {
        try {
          return await generateChapter(chapter);
        } catch (error) {
          // One bad chapter shouldn't discard the ones that worked - record it
          // and keep a placeholder so chapter numbering stays aligned. The
          // learner can regenerate it later from the course view.
          console.error(
            `Failed to generate chapter "${chapter?.chapterName}":`,
            error?.message ?? error
          );
          failures.push(chapter?.chapterName ?? "Untitled chapter");
          return error.partial ?? { YoutubeVideo: [], courseData: {} };
        }
      }
    );

    if (failures.length === chapters.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not generate any chapters. Please wait a minute and try again.",
        },
        { status: 502 }
      );
    }

    await db
      .update(coursesTable)
      .set({ courseContent: CourseContent })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      success: true,
      CourseContent,
      courseName: courseTitle,
      generatedChapters: chapters.length - failures.length,
      totalChapters: chapters.length,
      failedChapters: failures,
    });
  } catch (error) {
    console.error("generate-course-content failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Course generation failed." },
      { status: 500 }
    );
  }
}
