import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";
import { coursesTable } from "@/config/schema";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const PROMPT = `Depends on Chapter name and Topic Generate content for each topic in HTML 
and give response in JSON format.
Schema:{
chapterName:<>,
{
topic:<>,
content:<>
}
}
: User Input:
`;

export async function POST(req) {
  try {
    const { courseLayout, courseTitle, courseId } = await req.json();
    console.log(courseLayout);

    const promises = courseLayout?.chapters.map(async (chapter) => {
      const config = {
        responseModalities: ["TEXT"],
      };

      const model = "gemini-flash-latest";

      const contents = [
        {
          role: "user",
          parts: [
            {
              text: PROMPT + JSON.stringify(chapter),
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model,
        config,
        contents,
      });

      //console.log(response.candidates[0].content.parts[0].text);
      const RawRes = response?.candidates[0].content.parts[0].text;
      const RawJson = RawRes.replace("```json", "").replace("```", "").trim();
      let JSONResp;

      try {
        JSONResp = JSON.parse(RawJson);
      } catch {
        JSONResp = JSON.parse(jsonrepair(RawJson));
      }
      const YouTubeData = await GetYoutubeVideo(chapter?.chapterName)
      console.log(YouTubeData);
      
      return {
     YoutubeVideo:YouTubeData,
     courseData:JSONResp,
      };
    });

    const CourseContent = await Promise.all(promises);

    //Save To Db

    const dbresponse = await db.update(coursesTable).set({
       courseContent: CourseContent
    }).where(eq(coursesTable.cid,courseId))

    return NextResponse.json({
      success: true,
      CourseContent: CourseContent,
      courseName: courseTitle,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
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