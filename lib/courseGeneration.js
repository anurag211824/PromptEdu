import { invokeLlmJson } from "./llm.js";

/**
 * Shared chapter-generation logic.
 *
 * Both the initial bulk generation (`/api/generate-course-content`) and the
 * per-chapter retry (`/api/regenerate-chapters`) use this, so the prompt and
 * the shape of a saved chapter stay in one place.
 */
export const CHAPTER_CONTENT_PROMPT = `You are an expert course author. You will be given one chapter of a course
as JSON, containing a chapterName and a list of topics. Write the full teaching content
for EVERY topic in that chapter.

Return ONLY valid JSON matching this exact schema — no commentary around it:

{
  "chapterName": "string",
  "topics": [
    { "topic": "string", "content": "string of GitHub Flavored Markdown" }
  ]
}

Rules for the "content" Markdown of each topic:
- Write GitHub Flavored Markdown. Do NOT write HTML tags.
- Do NOT wrap the whole thing in a code fence. Only real code goes in fences.
- Aim for 250-400 words per topic. Teach the concept properly; do not write a summary.
- Structure every topic in this order, using these exact headings:
    ### Overview
    2-3 sentences on what this is and why it matters.

    ### Key Concepts
    A bullet list of 3-6 items, each starting with a **bold term** then an explanation.

    ### How It Works
    2-4 paragraphs, or a numbered list when the topic is a sequence of steps.

    ### Example
    A concrete worked example in a fenced code block that ALWAYS declares its
    language, like \`\`\`java or \`\`\`python or \`\`\`sql. The code must be real,
    runnable and correctly indented. Use a Markdown table instead when the topic
    is a comparison. Follow it with a sentence explaining what the example shows.

    ### Key Takeaways
    A bullet list of 2-4 short revision points.
- Use ### for those five headings only. Never use # or ##.
- Use \`backticks\` for inline identifiers, keywords, file names and commands.
- Use **bold** for genuinely important terms only, not for whole sentences.
- Markdown tables are welcome for comparisons; use proper | header | rows.
- Write in clear, plain language aimed at a learner meeting the topic for the first time.

Chapter input:
`;

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

/** Related YouTube videos for a topic. Returns [] on any failure. */
export async function getYoutubeVideos(topic) {
  if (!topic) return [];

  const params = new URLSearchParams({
    part: "snippet",
    q: topic,
    maxResults: "4",
    type: "video",
    key: process.env.YOUTUBE_API_KEY || "",
  });

  try {
    const response = await fetch(`${YOUTUBE_BASE_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("YouTube API returned non-OK:", response.status);
      return [];
    }

    const result = await response.json();
    if (result.error) {
      console.error("YouTube API error:", result.error);
      return [];
    }

    return (result.items ?? [])
      .filter((item) => item?.id?.videoId)
      .map((item) => ({
        videoId: item.id.videoId,
        title: item?.snippet?.title,
      }));
  } catch (err) {
    console.error("Failed to call YouTube API:", err);
    return [];
  }
}

/**
 * Generates one chapter's lesson content plus its related videos.
 * Throws if the model returns nothing usable, so callers can retry or record
 * the failure rather than saving a blank chapter.
 */
export async function generateChapter(chapter) {
  // Videos are independent of the lesson text, so a YouTube outage should never
  // cost us a chapter's content.
  const youtubePromise = getYoutubeVideos(chapter?.chapterName);

  try {
    const courseData = await invokeLlmJson(
      CHAPTER_CONTENT_PROMPT + JSON.stringify(chapter)
    );

    if (!Array.isArray(courseData?.topics) || courseData.topics.length === 0) {
      throw new Error("Model returned no topics for this chapter");
    }

    return { YoutubeVideo: await youtubePromise, courseData };
  } catch (error) {
    // Attach the videos so a failed chapter still renders something useful.
    error.partial = {
      YoutubeVideo: await youtubePromise,
      courseData: emptyChapter(chapter),
    };
    throw error;
  }
}

/** The placeholder saved for a chapter whose content could not be generated. */
export function emptyChapter(chapter) {
  return {
    chapterName: chapter?.chapterName,
    topics: (chapter?.topics ?? []).map((topic) => ({
      topic: typeof topic === "string" ? topic : topic?.topic,
      content: "",
    })),
  };
}

/** True when a saved chapter has no lesson text (failed or not yet generated). */
export function isChapterEmpty(entry) {
  const topics = entry?.courseData?.topics;
  if (!Array.isArray(topics) || topics.length === 0) return true;
  return topics.every((topic) => !topic?.content?.trim());
}

/** Runs `worker` over `items`, at most `limit` at a time, preserving order. */
export async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index], index);
      }
    }
  );

  await Promise.all(runners);
  return results;
}
