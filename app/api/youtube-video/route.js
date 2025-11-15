import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");

    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        topic
      )}&maxResults=5&type=video&key=${API_KEY}`
    );

    const data = await response.json();
     console.log(data);
     
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
