/**
 * Helpers for reading the AI-generated `courseContent` blob off an enrolled
 * course. The shape varies (it has changed across generator versions, and the
 * model occasionally returns a stringified payload), so everything here is
 * defensive and always returns a usable value.
 */

/** Pull the raw courseContent off whatever shape the enroll-course API returned. */
function getRawContent(courseInfo) {
  return (
    courseInfo?.[0]?.courses?.courseContent ??
    courseInfo?.[0]?.courseContent ??
    courseInfo?.courseContent ??
    null
  );
}

/** Normalize courseContent into an array of chapters. Never throws. */
export function getChapters(courseInfo) {
  const raw = getRawContent(courseInfo);
  if (!raw) return [];

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : parsed?.chapters ?? [];
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {
    const chapters = raw?.chapters ?? Object.values(raw);
    return Array.isArray(chapters) ? chapters : [];
  }
  return [];
}

/** Display title for a chapter, with a positional fallback. */
export function getChapterName(chapter, index) {
  return (
    chapter?.courseData?.chapterName ??
    chapter?.chapterName ??
    chapter?.title ??
    `Chapter ${index + 1}`
  );
}

/** Topics for a chapter as an array of `{ topic, content }`. Never throws. */
export function getTopics(chapter) {
  const courseData = chapter?.courseData;

  // Courses generated before the prompt was tightened sometimes carry a single
  // topic inlined on the chapter rather than a `topics` array.
  if (!courseData?.topics && !chapter?.topics && courseData?.content) {
    return [{ topic: courseData.topic ?? "Overview", content: courseData.content }];
  }

  let topics = courseData?.topics ?? chapter?.topics ?? [];

  if (typeof topics === "string") {
    try {
      const parsed = JSON.parse(topics);
      topics = Array.isArray(parsed) ? parsed : [];
    } catch {
      topics = [];
    }
  }
  if (!Array.isArray(topics)) return [];

  return topics.map((t) =>
    typeof t === "string" ? { topic: t, content: "" } : t ?? {}
  );
}

/** Title for a topic, with a positional fallback. */
export function getTopicName(topic, index) {
  if (typeof topic === "string") return topic;
  return topic?.topic ?? topic?.title ?? `Topic ${index + 1}`;
}

/** Related YouTube videos attached to a chapter. */
export function getChapterVideos(chapter) {
  const videos = chapter?.YoutubeVideo ?? chapter?.youtubeVideo ?? [];
  return Array.isArray(videos) ? videos.filter((v) => v?.videoId) : [];
}

/**
 * True when a chapter has no lesson text — either its generation failed or it
 * was never generated. Such chapters are saved as placeholders that still carry
 * the chapter and topic names.
 */
export function isChapterEmpty(chapter) {
  const topics = getTopics(chapter);
  if (topics.length === 0) return true;
  return topics.every((topic) => !topic?.content?.trim());
}

/** Indexes of every chapter currently missing its content. */
export function getEmptyChapterIndexes(courseInfo) {
  return getChapters(courseInfo)
    .map((chapter, index) => (isChapterEmpty(chapter) ? index : -1))
    .filter((index) => index !== -1);
}

/** The set of completed chapter indexes for the current enrollment. */
export function getCompletedChapters(courseInfo) {
  const completed = courseInfo?.[0]?.enrollCourse?.completedChapters;
  return Array.isArray(completed) ? completed.map(Number) : [];
}
