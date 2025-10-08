import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const user = await currentUser()
  if (courseId) {
    try {
      const result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.cid, courseId));
      console.log(result[0]);

      return NextResponse.json({ success: true, data: result[0] });
    } catch (error) {
      console.log(error);
      return NextResponse.json({ success: false, data: error.message });
    }
  }
  else{
    const result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.userEmail, user?.primaryEmailAddress?.emailAddress)).orderBy(desc(coursesTable.id));
      console.log(result);

      return NextResponse.json({ success: true, data: result });
  }
}

// When we do: new URL(req.url). we are creating a JavaScript URL object from the request’s URL string.
// Example in App Router:
// If the request is: http://localhost:3000/api/courses?courseId=123

// then:
// const url = new URL(req.url), url becomes an instance of the URL class with these properties:

// url.href → "http://localhost:3000/api/courses?courseId=123"
// url.origin → "http://localhost:3000"
// url.pathname → "/api/courses"
// url.search → "?courseId=123"
// url.searchParams → a URLSearchParams object

// So we can do:
// url.searchParams.get("courseId") // "123"

// In short:
// new URL(req.url) returns a full URL object, which lets you easily read parts of
// the URL (pathname, query, etc.) without manually splitting strings.
