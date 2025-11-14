import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { NextResponse } from "next/server";

export async function GET(req){
  try {
    const courses = await db.select().from(coursesTable);
    
    return NextResponse.json({success:true,data:courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}