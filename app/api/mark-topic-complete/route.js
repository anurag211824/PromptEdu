import { db } from "@/config/db";
import { enrollCourseTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { enrollCourseId, chapterIndex, topicId } = await req.json();
    console.log( enrollCourseId, chapterIndex, topicId);
    

    if (!enrollCourseId || chapterIndex === undefined || topicId===undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Fetch existing record
    const [existing] = await db
      .select()
      .from(enrollCourseTable)
      .where(eq(enrollCourseTable.id, enrollCourseId));

    if (!existing) {
      return NextResponse.json({ error: "Enroll course not found" }, { status: 404 });
    }

    // 2. Get old topics
    const oldData = existing.chapterWiseTopicsCompleted || {};

    const oldTopics = oldData[chapterIndex] || [];

    // 3. Prevent duplicate addition
    if (oldTopics.includes(topicId)) {
      return NextResponse.json({ message: "Topic already completed" });
    }

    // 4. Prepare updated object
    const updatedData = {
      ...oldData,
      [chapterIndex]: [...oldTopics, topicId]
    };

    // 5. Update DB
    await db
      .update(enrollCourseTable)
      .set({ chapterWiseTopicsCompleted: updatedData })
      .where(eq(enrollCourseTable.id, enrollCourseId));

    return NextResponse.json({
      message: "Topic marked completed",
      chapterWiseTopicsCompleted: updatedData
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}