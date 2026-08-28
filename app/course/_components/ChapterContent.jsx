"use client";
import { Button } from "@/components/ui/button";
import { SelectedChapterIndex } from "@/contexts/SelectedChapterIndex";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Loader2Icon,
  PartyPopper,
  Youtube,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import LessonContent from "./LessonContent";
import {
  getChapterName,
  getChapterVideos,
  getChapters,
  getCompletedChapters,
  getTopicName,
  getTopics,
} from "./courseContent";

function YouTubeEmbed({ videoId, title }) {
  return (
    <figure className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {title && (
        <figcaption
          className="line-clamp-2 text-xs leading-snug text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      )}
    </figure>
  );
}

function ChapterContent({ courseInfo, refreshData }) {
  const [loading, setLoading] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const { selectedChapterIndex, setSelectedChapterIndex } =
    useContext(SelectedChapterIndex);
  const topRef = useRef(null);

  const chapters = getChapters(courseInfo);
  const completedChapters = getCompletedChapters(courseInfo);
  const chapter = chapters[selectedChapterIndex];
  const topics = getTopics(chapter);
  const videos = getChapterVideos(chapter);

  const isComplete = completedChapters.includes(selectedChapterIndex);
  const hasPrev = selectedChapterIndex > 0;
  const hasNext = selectedChapterIndex < chapters.length - 1;
  const courseId = courseInfo?.[0]?.courses?.id;

  // Moving between chapters should always start the reader at the top,
  // and the videos panel shouldn't stay open across chapters.
  useEffect(() => {
    setShowVideos(false);
    topRef.current?.scrollIntoView({ block: "start" });
  }, [selectedChapterIndex]);

  const updateCompletion = async (nextCompleted, message) => {
    try {
      setLoading(true);
      const response = await fetch("/api/enroll-course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: Number(courseId),
          completedChapters: nextCompleted,
        }),
      });
      const data = await response.json();

      if (data.success) {
        await refreshData();
        toast.success(message);
        return true;
      }
      toast.error("Could not save your progress. Please try again.");
      return false;
    } catch (error) {
      console.error("Error updating chapter completion:", error);
      toast.error("Could not save your progress. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    const next = Array.from(
      new Set([...completedChapters, selectedChapterIndex])
    );
    const ok = await updateCompletion(next, "Chapter marked complete");
    // Keep the learner moving: drop them straight into the next chapter.
    if (ok && hasNext) setSelectedChapterIndex(selectedChapterIndex + 1);
  };

  const markIncomplete = () => {
    const next = completedChapters.filter((i) => i !== selectedChapterIndex);
    return updateCompletion(next, "Chapter marked incomplete");
  };

  if (chapters.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h2 className="text-lg font-semibold">No content yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This course doesn&apos;t have any generated chapters yet. Generate the
          course content and it will appear here.
        </p>
      </div>
    );
  }

  return (
    <article className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10">
      <div ref={topRef} className="scroll-mt-20" />

      {/* Chapter header */}
      <header className="border-b pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Chapter {selectedChapterIndex + 1} of {chapters.length}
        </p>
        <h1 className="mt-1.5 text-2xl font-bold leading-tight md:text-3xl">
          {getChapterName(chapter, selectedChapterIndex)}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {isComplete ? (
            <Button variant="outline" onClick={markIncomplete} disabled={loading}>
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <X aria-hidden />
              )}
              Mark incomplete
            </Button>
          ) : (
            <Button onClick={markComplete} disabled={loading}>
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <CheckCircle aria-hidden />
              )}
              Mark complete
            </Button>
          )}

          {videos.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => setShowVideos((open) => !open)}
              aria-expanded={showVideos}
            >
              <Youtube aria-hidden />
              {showVideos ? "Hide" : "Show"} {videos.length} related video
              {videos.length === 1 ? "" : "s"}
              <ChevronDown
                className={`transition-transform ${showVideos ? "rotate-180" : ""}`}
                aria-hidden
              />
            </Button>
          )}
        </div>

        {showVideos && videos.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {videos.map((video, index) => (
              <YouTubeEmbed
                key={video.videoId ?? index}
                videoId={video.videoId}
                title={video.title}
              />
            ))}
          </div>
        )}
      </header>

      {/* Topics */}
      {topics.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">
          No topics available for this chapter.
        </p>
      ) : (
        <div className="divide-y">
          {topics.map((item, index) => (
            <section
              key={index}
              id={`topic-${selectedChapterIndex}-${index}`}
              className="scroll-mt-20 py-8"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold leading-snug">
                  <span className="mr-2 text-muted-foreground tabular-nums">
                    {selectedChapterIndex + 1}.{index + 1}
                  </span>
                  {getTopicName(item, index)}
                </h2>
                <Link
                  href={`/youtube/${encodeURIComponent(getTopicName(item, index))}`}
                  className="shrink-0"
                >
                  <Button variant="ghost" size="sm" title="Find videos on this topic">
                    <Youtube aria-hidden />
                    <span className="sr-only sm:not-sr-only">Videos</span>
                  </Button>
                </Link>
              </div>

              {item.content ? (
                <LessonContent html={item.content} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No content generated for this topic.
                </p>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Chapter-to-chapter navigation */}
      <nav
        aria-label="Chapter navigation"
        className="mt-4 flex items-stretch gap-3 border-t pt-6"
      >
        {hasPrev ? (
          <button
            type="button"
            onClick={() => setSelectedChapterIndex(selectedChapterIndex - 1)}
            className="group flex flex-1 items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Previous</span>
              <span className="block truncate text-sm font-medium">
                {getChapterName(chapters[selectedChapterIndex - 1], selectedChapterIndex - 1)}
              </span>
            </span>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {hasNext ? (
          <button
            type="button"
            onClick={() => setSelectedChapterIndex(selectedChapterIndex + 1)}
            className="group flex flex-1 items-center justify-end gap-3 rounded-lg border p-4 text-right transition-colors hover:bg-accent"
          >
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Next</span>
              <span className="block truncate text-sm font-medium">
                {getChapterName(chapters[selectedChapterIndex + 1], selectedChapterIndex + 1)}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        ) : (
          <div className="flex flex-1 items-center justify-end gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <PartyPopper className="h-4 w-4" aria-hidden />
            Last chapter
          </div>
        )}
      </nav>
    </article>
  );
}

export default ChapterContent;
