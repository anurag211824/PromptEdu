import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import {
  emptyChapter,
  generateChapter,
  isChapterEmpty,
  mapWithConcurrency,
} from "@/lib/courseGeneration";

export const maxDuration = 60;

const CONCURRENCY = 2;

/**
 * Regenerates specific chapters of a course that failed to generate, and merges
 * the results into the stored courseContent without disturbing the chapters
 * that already worked.
 *
 * Body: { courseId: <cid>, chapterIndexes?: number[] }
 * Omitting chapterIndexes regenerates every chapter that is currently empty.
 */
export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, chapterIndexes } = await req.json();
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

    // The layout is the source of truth for what each chapter should contain;
    // the saved content may only hold a placeholder.
    const layoutChapters = course?.courseJson?.course?.chapters ?? [];
    const existing = Array.isArray(course.courseContent)
      ? [...course.courseContent]
      : [];

    // Default to every chapter that currently has no lesson text.
    const targets = Array.isArray(chapterIndexes) && chapterIndexes.length > 0
      ? chapterIndexes
          .map(Number)
          .filter((i) => Number.isInteger(i) && i >= 0 && i < layoutChapters.length)
      : layoutChapters
          .map((_, index) => index)
          .filter((index) => isChapterEmpty(existing[index]));

    if (targets.length === 0) {
      return NextResponse.json({
        success: true,
        regenerated: 0,
        failed: [],
        message: "Every chapter already has content.",
      });
    }

    const failed = [];

    const results = await mapWithConcurrency(
      targets,
      CONCURRENCY,
      async (index) => {
        // Prefer the original layout, falling back to the saved placeholder
        // (which still carries the chapter and topic names).
        const chapter = layoutChapters[index] ?? {
          chapterName: existing[index]?.courseData?.chapterName,
          topics: (existing[index]?.courseData?.topics ?? []).map((t) => t?.topic),
        };

        try {
          return { index, entry: await generateChapter(chapter), ok: true };
        } catch (error) {
          console.error(
            `Regeneration failed for chapter ${index} ("${chapter?.chapterName}"):`,
            error?.message ?? error
          );
          failed.push(chapter?.chapterName ?? `Chapter ${index + 1}`);
          return {
            index,
            // Keep whatever was already saved rather than clobbering it.
            entry:
              existing[index] ??
              error.partial ?? { YoutubeVideo: [], courseData: emptyChapter(chapter) },
            ok: false,
          };
        }
      }
    );

    // Merge back in, leaving every untouched chapter exactly as it was.
    const merged = [...existing];
    // Grow the array if content was never generated for later chapters.
    for (let i = merged.length; i < layoutChapters.length; i++) {
      merged[i] = { YoutubeVideo: [], courseData: emptyChapter(layoutChapters[i]) };
    }
    results.forEach(({ index, entry }) => {
      merged[index] = entry;
    });

    await db
      .update(coursesTable)
      .set({ courseContent: merged })
      .where(eq(coursesTable.cid, courseId));

    const regenerated = results.filter((r) => r.ok).length;

    if (regenerated === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not generate the chapter. Please wait a minute and try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      regenerated,
      attempted: targets.length,
      failed,
    });
  } catch (error) {
    console.error("regenerate-chapters failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Regeneration failed." },
      { status: 500 }
    );
  }
}
