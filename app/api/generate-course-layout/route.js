import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
const PROMPT = `Generate Learning Course depends on following details.  
In which Make sure to add Course Name, Description, Course Banner Image Prompt (Create a modern,  
flat-style 2D digital illustration representing user Topic. Include UI/UX elements  such as mockup 
screens, text blocks, icons, buttons, and creative workspace tools.  
Add symbolic elements related to user Course, like sticky notes, design components, 
and visual aids.  Use a vibrant color palette (blues, purples, oranges) with a clean, 
professional look.  The illustration should feel creative, tech-savvy, and educational, 
ideal for visualizing concepts in  user Course) for Course Banner in 3d format Chapter Name, 
Topic under each chapters,  Duration for each chapters etc, in JSON format only Schema: 
{ "course": { "course_name": "string", "course_description": "string", "category": "string", "
 difficulty": "string", "include_videos": "boolean", "chapters_number": "number", "bannerImagePrompt": 
 "string", "chapters": [ { "chapterName": "string", "duration": "string", "topics": [ "string" ] } ] } } 
 User Input: ;`;
export async function POST(req) {
  try {
     console.log("Before parsing formData"); 
    const formData = await req.json();
    console.log("Form data received:", formData);
    
    const user = await currentUser()
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const config = {
      responseModalities: ["TEXT"],
    };
    const model = "gemini-2.5-pro";
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: PROMPT + JSON.stringify(formData),
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    console.log(response.candidates[0].content.parts[0].text);
    const RawRes = response?.candidates[0].content.parts[0].text
    const RawJson =  RawRes.replace('```json','').replace('```','')
    const JSONResp = JSON.parse(RawJson)
    const imagePrompt = JSONResp.course?.bannerImagePrompt

    // generate Image
     const imageUrl = await generateImage(imagePrompt);
    // Save to Database
    const result = await db.insert(coursesTable).values({
      ...formData,
      courseJson:JSONResp,
      userEmail:user?.primaryEmailAddress?.emailAddress,
      cid:formData.courseId,
      bannerImageUrl: imageUrl
    })
    
    return NextResponse.json({ success: true, courseId:formData.courseId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function generateImage(prompt) {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&seed=${Date.now()}`;
    
    console.log("Generated image URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
