import { db } from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { courseId } = await req.json();

  const user = await currentUser();

  // course already enrolled

  try {
    const enrollCourses = await db
      .select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(
            enrollCourseTable.userEmail,
            user.primaryEmailAddress.emailAddress
          ),
          eq(enrollCourseTable.courseId, courseId)
        )
      );

    if (enrollCourses.length === 0) {
      const result = await db
        .insert(enrollCourseTable)
        .values({
          courseId: courseId,
          userEmail: user.primaryEmailAddress?.emailAddress,
        })
        .returning(enrollCourseTable);

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: false, data: "Already enrolled" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, data: error });
  }
}

export async function GET(req) {
  try {
    const user = await currentUser();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (courseId) {
      const result = await db
        .select()
        .from(coursesTable)
        .innerJoin(
          enrollCourseTable,
          eq(coursesTable.id, enrollCourseTable.courseId)
        )
        .where(
          and(
            eq(
              enrollCourseTable.userEmail,
              user.primaryEmailAddress.emailAddress
            ),
            eq(coursesTable.cid, courseId)
          )
        );

      return NextResponse.json({ success: true, data: result });
    } else {
      const result = await db
        .select()
        .from(coursesTable)
        .innerJoin(
          enrollCourseTable,
          eq(coursesTable.id, enrollCourseTable.courseId)
        )
        .where(
          eq(enrollCourseTable.userEmail, user.primaryEmailAddress.emailAddress)
        )
        .orderBy(desc(enrollCourseTable.courseId));

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, data: error });
  }
}

export async function PUT(req) {
  try {
    const { courseId, completedChapters } = await req.json();
    const user = await currentUser();

    console.log("BODY RECEIVED:", { courseId, completedChapters });

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Ensure completedChapters is always an array
    const safeCompletedChapters = Array.isArray(completedChapters)
      ? completedChapters
      : [completedChapters];

    const result = await db
      .update(enrollCourseTable)
      .set({ completedChapters: safeCompletedChapters })
      .where(
        and(
          eq(enrollCourseTable.courseId, courseId),
          eq(enrollCourseTable.userEmail, user.primaryEmailAddress.emailAddress)
        )
      )
      .returning();

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}



export async function DELETE(req) {
  try {
    const { id } = await req.json(); // enrollCourse.id

    // 1. Fetch enroll row
    const [enrolled] = await db
      .select()
      .from(enrollCourseTable)
      .where(eq(enrollCourseTable.id, id));

    if (!enrolled) {
      return NextResponse.json({ error: "Enrollment not found" });
    }

    // 2. Delete enroll entry
    await db
      .delete(enrollCourseTable)
      .where(eq(enrollCourseTable.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" });
  }
}

