"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import YouTube from "react-youtube";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  LayoutDashboard,
  Loader2Icon,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { toast } from "sonner";
import { formatTimestamp } from "@/lib/formatTime";

function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoCard({ video, saved, onSave, onRemove, busy, canSave }) {
  const playerRef = useRef(null);
  const vid = video.id.videoId;
  const title = video.snippet?.title || "Untitled";
  const channel = video.snippet?.channelTitle || "";

  // Read the current playhead so "save" remembers where you stopped.
  const currentSeconds = () => {
    try {
      return Math.floor(playerRef.current?.getCurrentTime?.() ?? 0);
    } catch {
      return 0;
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <div className="aspect-video w-full bg-black">
        <YouTube
          videoId={vid}
          className="h-full w-full"
          iframeClassName="h-full w-full"
          opts={{
            playerVars: { start: saved?.resumeSeconds || 0 },
          }}
          onReady={(event) => {
            playerRef.current = event.target;
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div>
          <h2
            className="line-clamp-2 text-sm font-semibold leading-snug"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="mt-1 text-xs text-muted-foreground">{channel}</p>
        </div>

        {canSave && (
          <div className="mt-auto flex items-center gap-2">
            {saved ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => onRemove(saved)}
                  className="flex-1"
                >
                  <BookmarkCheck
                    className="text-green-600 dark:text-green-500"
                    aria-hidden
                  />
                  Saved
                  {saved.resumeSeconds > 0 && (
                    <span className="text-xs text-muted-foreground">
                      at {formatTimestamp(saved.resumeSeconds)}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  title="Update the saved position to the current time"
                  onClick={() => onSave(video, currentSeconds())}
                >
                  Update time
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                disabled={busy}
                onClick={() => onSave(video, currentSeconds())}
                className="w-full"
              >
                {busy ? (
                  <Loader2Icon className="animate-spin" aria-hidden />
                ) : (
                  <Bookmark aria-hidden />
                )}
                Save to this topic
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function YoutubeRelatedVideos() {
  const { topic } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId") || "";
  const chapterIndex = searchParams.get("chapter");
  const topicIndex = searchParams.get("topic");
  // Saving needs to know which course/chapter/topic to attach the video to.
  const canSave = Boolean(courseId && chapterIndex !== null && topicIndex !== null);

  const [videos, setVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const topicLabel = topic ? decodeURIComponent(topic) : "";

  const loadSaved = useCallback(async () => {
    if (!canSave) return;
    try {
      const response = await fetch(
        `/api/saved-videos?courseId=${encodeURIComponent(courseId)}&chapter=${chapterIndex}&topic=${topicIndex}`
      );
      const data = await response.json();
      setSavedVideos(data.data ?? []);
    } catch (err) {
      console.error("Failed to load saved videos:", err);
    }
  }, [canSave, courseId, chapterIndex, topicIndex]);

  useEffect(() => {
    if (!topic) return;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/youtube-video?topic=${topic}`);
        const result = await response.json();
        setVideos(Array.isArray(result?.items) ? result.items : []);
      } catch (err) {
        console.error("Failed fetching videos:", err);
        setError(err?.message || "Failed to fetch videos");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    loadSaved();
  }, [topic, loadSaved]);

  const handleSave = async (video, resumeSeconds) => {
    const vid = video.id.videoId;
    try {
      setBusyId(vid);
      const response = await fetch("/api/saved-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          chapterIndex: Number(chapterIndex),
          topicIndex: Number(topicIndex),
          topicName: topicLabel,
          videoId: vid,
          videoTitle: video.snippet?.title,
          channelTitle: video.snippet?.channelTitle,
          resumeSeconds,
        }),
      });
      const data = await response.json();

      if (data.success) {
        await loadSaved();
        toast.success(
          resumeSeconds > 0
            ? `Saved at ${formatTimestamp(resumeSeconds)}`
            : "Saved to this topic"
        );
      } else {
        toast.error(data.error ?? "Could not save the video.");
      }
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Could not save the video.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (saved) => {
    try {
      setBusyId(saved.videoId);
      const response = await fetch("/api/saved-videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saved.id }),
      });
      const data = await response.json();

      if (data.success) {
        await loadSaved();
        toast.success("Removed from saved");
      } else {
        toast.error("Could not remove the video.");
      }
    } catch (err) {
      console.error("Remove failed:", err);
      toast.error("Could not remove the video.");
    } finally {
      setBusyId(null);
    }
  };

  const videoItems = videos.filter((v) => v?.id?.videoId);
  const savedFor = (videoId) => savedVideos.find((s) => s.videoId === videoId);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-3 md:px-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft aria-hidden />
          Back
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            Videos for “{topicLabel}”
          </p>
        </div>

        {canSave && (
          <Link
            href={
              `/course/${courseId}/saved` +
              `?chapter=${chapterIndex}&topic=${topicIndex}` +
              `&topicName=${encodeURIComponent(topicLabel)}`
            }
          >
            <Button variant="ghost" size="sm">
              <Bookmark aria-hidden />
              <span className="hidden sm:inline">Saved</span>
            </Button>
          </Link>
        )}

        <Link href="/workspace">
          <Button variant="ghost" size="sm">
            <LayoutDashboard aria-hidden />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-6xl p-5 md:p-7">
        <h1 className="text-2xl font-bold break-words">{topicLabel}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canSave
            ? "Save any video to come back to it later — it remembers where you stopped."
            : "Videos from YouTube related to this topic."}
        </p>

        <div className="mt-6">
          {loading ? (
            <VideoGridSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="font-medium">Couldn&apos;t load videos</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.refresh()}
              >
                Try again
              </Button>
            </div>
          ) : videoItems.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
              <YoutubeIcon
                className="mb-3 h-8 w-8 text-muted-foreground"
                aria-hidden
              />
              <p className="font-medium">No videos found</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Nothing came back for “{topicLabel}”.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.back()}
              >
                <ArrowLeft aria-hidden />
                Back to the course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videoItems.map((video) => (
                <VideoCard
                  key={video.id.videoId}
                  video={video}
                  saved={savedFor(video.id.videoId)}
                  onSave={handleSave}
                  onRemove={handleRemove}
                  busy={busyId === video.id.videoId}
                  canSave={canSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the app router.
export default function YoutubePage() {
  return (
    <Suspense fallback={<VideoGridSkeleton />}>
      <YoutubeRelatedVideos />
    </Suspense>
  );
}
