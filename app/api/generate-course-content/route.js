import { NextResponse } from "next/server";
import { coursesTable } from "@/config/schema";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { invokeLlmJson } from "@/lib/llm";

// Generating a whole course is slow (one model call per chapter), so this route
// needs far longer than the default serverless timeout. 60s is the ceiling on
// Vercel's Hobby plan; raise it to 300 on Pro if large courses still time out.
export const maxDuration = 60;

const PROMPT = `You are an expert course author. You will be given one chapter of a course
as JSON, containing a chapterName and a list of topics. Write the full teaching content
for EVERY topic in that chapter.

Return ONLY valid JSON matching this exact schema — no markdown fence, no commentary:

{
  "chapterName": "string",
  "topics": [
    { "topic": "string", "content": "string of HTML" }
  ]
}

Rules for the "content" HTML of each topic:
- Return a fragment only. No <html>, <head>, <body>, <style> or <script>.
- The only class attribute allowed anywhere is "language-xxx" on a <code> inside a <pre>,
  naming the language (language-java, language-python, language-js, language-sql, ...).
  Always set it so the code can be syntax highlighted.
- Aim for 250-400 words per topic. Teach the concept properly; do not write a summary.
- Structure every topic in this order, using these exact section headings:
    <h3>Overview</h3>        - 2-3 sentences on what this is and why it matters.
    <h3>Key Concepts</h3>    - a <ul> of 3-6 <li>, each starting with a <strong>term</strong> followed by an explanation.
    <h3>How It Works</h3>    - 2-4 <p> paragraphs, or an <ol> when the topic is a sequence of steps.
    <h3>Example</h3>         - a concrete worked example. Use
                               <pre><code class="language-xxx">...</code></pre> for code
                               (real, runnable, correctly indented) or a <table> for comparisons.
                               Follow it with a <p> explaining what the example shows.
    <h3>Key Takeaways</h3>   - a <ul> of 2-4 short <li> revision points.
- Use <h3> for these section headings only. Never use <h1> or <h2>.
- Use <code> for inline identifiers, keywords, file names and commands.
- Use <strong> for genuinely important terms only, not for whole sentences.
- Escape &, < and > inside code samples as &amp;, &lt; and &gt;.
- Write in clear, plain language aimed at a learner meeting the topic for the first time.

Chapter input:
`;

// Chapters used to all fire at once, which tripped the provider's per-minute
// limit as soon as a course had more than a handful of them. A few at a time
// keeps inside the quota while still being much faster than going one by one.
// Retries and model fallback live in lib/llm.js.
const CONCURRENCY = 3;

/** Runs `worker` over `items`, at most `limit` at a time, preserving order. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}

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
        // Videos are independent of the lesson text, so a YouTube outage should
        // never cost us a chapter's content.
        const youtubePromise = GetYoutubeVideo(chapter?.chapterName);

        try {
          const courseData = await invokeLlmJson(
            PROMPT + JSON.stringify(chapter)
          );

          // A chapter with no topics means the response was unparseable or
          // truncated. Count it as a failure so it is reported and can be
          // re-run, rather than quietly saving a blank chapter.
          if (!Array.isArray(courseData?.topics) || courseData.topics.length === 0) {
            throw new Error("Model returned no topics for this chapter");
          }

          return {
            YoutubeVideo: await youtubePromise,
            courseData,
          };
        } catch (error) {
          // One bad chapter shouldn't discard the ones that worked - record it
          // and keep a placeholder so chapter numbering stays aligned.
          console.error(
            `Failed to generate chapter "${chapter?.chapterName}":`,
            error?.message ?? error
          );
          failures.push(chapter?.chapterName ?? "Untitled chapter");

          return {
            YoutubeVideo: await youtubePromise,
            courseData: {
              chapterName: chapter?.chapterName,
              topics: (chapter?.topics ?? []).map((topic) => ({
                topic: typeof topic === "string" ? topic : topic?.topic,
                content: "",
              })),
            },
          };
        }
      }
    );

    if (failures.length === chapters.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not generate any chapters. The AI service may be rate limited — please wait a minute and try again.",
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

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

const GetYoutubeVideo = async (topic) => {
  if (!topic) return [];

  const params = new URLSearchParams({
    part: "snippet",
    q: topic,
    maxResults: "4",
    type: "video",
    key: process.env.YOUTUBE_API_KEY || "",
  });

  const url = `${YOUTUBE_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("YouTube API returned non-OK:", response.status, text);
      return [];
    }

    const result = await response.json();

    if (result.error) {
      console.error("YouTube API error:", result.error);
      return [];
    }
    const youTubeVideoList = []
    result.items.forEach((item)=>{
        const data = {
            videoId:item.id.videoId,
            title:item?.snippet?.title
        }
        youTubeVideoList.push(data)
    })
    return youTubeVideoList || [];
  } catch (err) {
    console.error("Failed to call YouTube API:", err);
    return [];
  }
};





// import { NextResponse } from "next/server";
// import { jsonrepair } from "jsonrepair";
// import { coursesTable } from "@/config/schema";
// import { db } from "@/config/db";
// import { eq } from "drizzle-orm";

// const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

// const PROMPT = `Depends on Chapter name and Topic Generate content for each topic in HTML 
// and give response in JSON format.
// Schema:{
// chapterName:<>,
// {
// topic:<>,
// content:<>
// }
// }
// : User Input:
// `;

// async function callOllama(prompt, retries = 2) {
//   try {
//     const response = await fetch(`${OLLAMA_URL}/api/generate`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "tinyllama",
//         prompt: prompt,
//         stream: false,
//         format: "json"
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Ollama API error: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.response;
//   } catch (error) {
//     if (retries > 0) {
//       console.warn("Ollama call failed. Retrying in 3 seconds...");
//       await new Promise(res => setTimeout(res, 3000));
//       return callOllama(prompt, retries - 1);
//     }
//     throw error;
//   }
// }

// export async function POST(req) {
//   try {
//     const { courseLayout, courseTitle, courseId } = await req.json();
//     console.log(courseLayout);

//     const promises = courseLayout?.chapters.map(async (chapter) => {
//       const fullPrompt = PROMPT + JSON.stringify(chapter);

//       const RawRes = await callOllama(fullPrompt);
      
//       let JSONResp;

//       try {
//         JSONResp = JSON.parse(RawRes);
//       } catch {
//         JSONResp = JSON.parse(jsonrepair(RawRes));
//       }
      
//       const YouTubeData = await GetYoutubeVideo(chapter?.chapterName);
//       console.log(YouTubeData);
      
//       return {
//         YoutubeVideo: YouTubeData,
//         courseData: JSONResp,
//       };
//     });

//     const CourseContent = await Promise.all(promises);

//     //Save To Db
//     const dbresponse = await db.update(coursesTable).set({
//       courseContent: CourseContent
//     }).where(eq(coursesTable.cid, courseId));

//     return NextResponse.json({
//       success: true,
//       CourseContent: CourseContent,
//       courseName: courseTitle,
//     });
//   } catch (error) {
//     console.log(error);
//     return NextResponse.json({ success: false });
//   }
// }

// const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

// const GetYoutubeVideo = async (topic) => {
//   if (!topic) return [];

//   const params = new URLSearchParams({
//     part: "snippet",
//     q: topic,
//     maxResults: "4",
//     type: "video",
//     key: process.env.YOUTUBE_API_KEY || "",
//   });

//   const url = `${YOUTUBE_BASE_URL}?${params.toString()}`;

//   try {
//     const response = await fetch(url, {
//       headers: {
//         Accept: "application/json",
//       },
//     });

//     if (!response.ok) {
//       const text = await response.text();
//       console.error("YouTube API returned non-OK:", response.status, text);
//       return [];
//     }

//     const result = await response.json();

//     if (result.error) {
//       console.error("YouTube API error:", result.error);
//       return [];
//     }
    
//     const youTubeVideoList = [];
//     result.items.forEach((item) => {
//       const data = {
//         videoId: item.id.videoId,
//         title: item?.snippet?.title
//       };
//       youTubeVideoList.push(data);
//     });
    
//     return youTubeVideoList || [];
//   } catch (err) {
//     console.error("Failed to call YouTube API:", err);
//     return [];
//   }
// };