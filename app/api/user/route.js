// app/api/user/route.js
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await db.select().from(usersTable);
    return NextResponse.json({ users, success: true });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {    
    // get JSON body
    const { name, email } = await req.json();

    // check if user already exists
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existing.length === 0) {
      const inserted = await db
        .insert(usersTable)
        .values({ name, email })
        .returning(usersTable);

      return NextResponse.json({ user: inserted[0], success: true });
    }

    // user already exists, return existing
    return NextResponse.json({ user: existing[0], success: true });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
}
