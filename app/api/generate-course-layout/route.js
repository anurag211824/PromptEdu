import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const RATE_LIMIT_TIME = 20000; // 20 seconds
const userRequestTimestamps = new Map();

const PROMPT = `Generate Learning Course based on the following details.
Make sure to include:
- Course Name,
- Course Description,
- Category,
- Difficulty,
- Number of Chapters,
- Include Videos,
- 3D Banner Image Prompt,
- Chapters with Duration and Topics.
Return valid JSON only in this format:
{
  "course": {
    "course_name": "string",
    "course_description": "string",
    "category": "string",
    "difficulty": "string",
    "include_videos": "boolean",
    "chapters_number": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      { "chapterName": "string", "duration": "string", "topics": ["string"] }
    ]
  }
}
User Input:
`;

function rateLimit(userId) {
  const now = Date.now();
  if (userRequestTimestamps.has(userId)) {
    const lastReq = userRequestTimestamps.get(userId);
    if (now - lastReq < RATE_LIMIT_TIME) {
      throw new Error("You're doing it too fast. Please wait a few seconds and try again.");
    }
  }
  userRequestTimestamps.set(userId, now);
}

async function safeGeminiCall(ai, model, config, contents, retries = 2) {
  try {
    return await ai.models.generateContent({ model, config, contents });
  } catch (error) {
    if (error.status === 429 && retries > 0) {
      console.warn("Rate limit reached. Retrying in 5 seconds...");
      await new Promise(res => setTimeout(res, 5000));
      return safeGeminiCall(ai, model, config, contents, retries - 1);
    }
    throw error;
  }
}

export async function POST(req) {
  try {
    const formData = await req.json();
    const user = await currentUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    rateLimit(user.id);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const contents = [
      {
        role: "user",
        parts: [{ text: PROMPT + JSON.stringify(formData) }],
      },
    ];

    const response = await safeGeminiCall(
      ai,
      "gemini-flash-latest",
      { responseModalities: ["TEXT"] },
      contents
    );

    let rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    rawText = rawText.replace(/```json|```/g, "").trim();

    let jsonResp;
    try {
      jsonResp = JSON.parse(rawText);
    } catch {
      throw new Error("AI response was not valid JSON");
    }

    const imagePrompt = jsonResp?.course?.bannerImagePrompt || "3D abstract course banner";

    const imageUrl = await generateImage(imagePrompt);

    await db.insert(coursesTable).values({
      ...formData,
      courseJson: jsonResp,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      cid: formData.courseId,
      bannerImageUrl: imageUrl
    });

    return NextResponse.json({ success: true, courseId: formData.courseId });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function generateImage(prompt) {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&seed=${Date.now()}`;
  } catch {
    return null;
  }
}




// import { db } from "@/config/db";
// import { coursesTable } from "@/config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const RATE_LIMIT_TIME = 20000; // 20 seconds
// const userRequestTimestamps = new Map();

// const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

// const PROMPT = `Generate Learning Course based on the following details.
// Make sure to include:
// - Course Name,
// - Course Description,
// - Category,
// - Difficulty,
// - Number of Chapters,
// - Include Videos,
// - 3D Banner Image Prompt,
// - Chapters with Duration and Topics.
// Return valid JSON only in this format:
// {
//   "course": {
//     "course_name": "string",
//     "course_description": "string",
//     "category": "string",
//     "difficulty": "string",
//     "include_videos": "boolean",
//     "chapters_number": "number",
//     "bannerImagePrompt": "string",
//     "chapters": [
//       { "chapterName": "string", "duration": "string", "topics": ["string"] }
//     ]
//   }
// }
// User Input:
// `;

// function rateLimit(userId) {
//   const now = Date.now();
//   if (userRequestTimestamps.has(userId)) {
//     const lastReq = userRequestTimestamps.get(userId);
//     if (now - lastReq < RATE_LIMIT_TIME) {
//       throw new Error("You're doing it too fast. Please wait a few seconds and try again.");
//     }
//   }
//   userRequestTimestamps.set(userId, now);
// }

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
//     const formData = await req.json();
//     const user = await currentUser();

//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     rateLimit(user.id);

//     const fullPrompt = PROMPT + JSON.stringify(formData);

//     const rawText = await callOllama(fullPrompt);

//     let jsonResp;
//     try {
//       jsonResp = JSON.parse(rawText);
//     } catch {
//       throw new Error("AI response was not valid JSON");
//     }

//     const imagePrompt = jsonResp?.course?.bannerImagePrompt || "3D abstract course banner";

//     const imageUrl = await generateImage(imagePrompt);

//     await db.insert(coursesTable).values({
//       ...formData,
//       courseJson: jsonResp,
//       userEmail: user?.primaryEmailAddress?.emailAddress,
//       cid: formData.courseId,
//       bannerImageUrl: imageUrl
//     });

//     return NextResponse.json({ success: true, courseId: formData.courseId });

//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// async function generateImage(prompt) {
//   try {
//     const encodedPrompt = encodeURIComponent(prompt);
//     return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&seed=${Date.now()}`;
//   } catch {
//     return null;
//   }
// }