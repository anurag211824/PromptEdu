import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/config/db";
import { savedVideoTable } from "@/config/schema";

/** The signed-in user's email, or null. */
async function getUserEmail() {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

/**
 * GET  /api/saved-videos                      -> everything the user saved
 * GET  /api/saved-videos?courseId=<cid>       -> saved videos for one course
 * GET  /api/saved-videos?courseId=&chapter=&topic=  -> for one topic
 */
export async function GET(req) {
  try {
    const email = await getUserEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const chapter = searchParams.get("chapter");
    const topic = searchParams.get("topic");

    const filters = [eq(savedVideoTable.userEmail, email)];
    if (courseId) filters.push(eq(savedVideoTable.courseCid, courseId));
    if (chapter !== null && chapter !== "") {
      filters.push(eq(savedVideoTable.chapterIndex, Number(chapter)));
    }
    if (topic !== null && topic !== "") {
      filters.push(eq(savedVideoTable.topicIndex, Number(topic)));
    }

    const data = await db
      .select()
      .from(savedVideoTable)
      .where(and(...filters))
      .orderBy(desc(savedVideoTable.createdAt));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("saved-videos GET failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message, data: [] },
      { status: 500 }
    );
  }
}

/** Saves a video against a course/chapter/topic. Re-saving updates in place. */
export async function POST(req) {
  try {
    const email = await getUserEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      courseId,
      chapterIndex,
      topicIndex,
      topicName,
      videoId,
      videoTitle,
      channelTitle,
      resumeSeconds = 0,
      note = null,
    } = await req.json();

    if (!courseId || !videoId) {
      return NextResponse.json(
        { success: false, error: "A courseId and videoId are required." },
        { status: 400 }
      );
    }

    const values = {
      userEmail: email,
      courseCid: courseId,
      chapterIndex: Number(chapterIndex) || 0,
      topicIndex: Number(topicIndex) || 0,
      topicName: topicName ?? null,
      videoId,
      videoTitle: videoTitle ?? null,
      channelTitle: channelTitle ?? null,
      resumeSeconds: Math.max(0, Math.floor(Number(resumeSeconds) || 0)),
      note,
    };

    // The unique index means saving the same video twice is an update, not a
    // duplicate row — so re-saving simply refreshes the timestamp and note.
    const [saved] = await db
      .insert(savedVideoTable)
      .values(values)
      .onConflictDoUpdate({
        target: [
          savedVideoTable.userEmail,
          savedVideoTable.courseCid,
          savedVideoTable.chapterIndex,
          savedVideoTable.topicIndex,
          savedVideoTable.videoId,
        ],
        set: {
          resumeSeconds: values.resumeSeconds,
          note: values.note,
          videoTitle: values.videoTitle,
          channelTitle: values.channelTitle,
        },
      })
      .returning();

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("saved-videos POST failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

/** Updates a saved video's note, resume point or watched flag. */
export async function PATCH(req) {
  try {
    const email = await getUserEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, note, resumeSeconds, watched } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "An id is required." },
        { status: 400 }
      );
    }

    const patch = {};
    if (note !== undefined) patch.note = note;
    if (resumeSeconds !== undefined) {
      patch.resumeSeconds = Math.max(0, Math.floor(Number(resumeSeconds) || 0));
    }
    if (watched !== undefined) patch.watched = Boolean(watched);

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: "Nothing to update." });
    }

    const [updated] = await db
      .update(savedVideoTable)
      .set(patch)
      // Scoped to the owner so one user can't edit another's saved video.
      .where(
        and(eq(savedVideoTable.id, Number(id)), eq(savedVideoTable.userEmail, email))
      )
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("saved-videos PATCH failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

/** Removes a saved video. */
export async function DELETE(req) {
  try {
    const email = await getUserEmail();
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "An id is required." },
        { status: 400 }
      );
    }

    await db
      .delete(savedVideoTable)
      .where(
        and(eq(savedVideoTable.id, Number(id)), eq(savedVideoTable.userEmail, email))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("saved-videos DELETE failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
