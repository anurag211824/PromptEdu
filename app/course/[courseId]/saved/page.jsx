"use client";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Bookmark,
  Check,
  ExternalLink,
  Loader2Icon,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatTimestamp } from "@/lib/formatTime";

function SavedVideoCard({ video, onChange }) {
  const [busy, setBusy] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [note, setNote] = useState(video.note ?? "");

  // Resume at the exact second it was saved at.
  const watchHref = `https://www.youtube.com/watch?v=${video.videoId}${
    video.resumeSeconds ? `&t=${video.resumeSeconds}s` : ""
  }`;

  const patch = async (body, message) => {
    try {
      setBusy(true);
      const response = await fetch("/api/saved-videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: video.id, ...body }),
      });
      const data = await response.json();
      if (data.success) {
        if (message) toast.success(message);
        onChange();
      } else {
        toast.error("Could not update. Please try again.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Could not update. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      setBusy(true);
      const response = await fetch("/api/saved-videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: video.id }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Removed");
        onChange();
      } else {
        toast.error("Could not remove. Please try again.");
      }
    } catch (error) {
      console.error("Remove failed:", error);
      toast.error("Could not remove. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <a href={watchHref} target="_blank" rel="noopener noreferrer">
        <img
          src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
          alt=""
          className="aspect-video w-full bg-muted object-cover"
          loading="lazy"
        />
      </a>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3
            className="line-clamp-2 text-sm font-semibold leading-snug"
            dangerouslySetInnerHTML={{ __html: video.videoTitle ?? "Untitled" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">{video.channelTitle}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Chapter {video.chapterIndex + 1}
          {video.topicName ? ` · ${video.topicName}` : ""}
          {video.resumeSeconds > 0 && (
            <> · stopped at {formatTimestamp(video.resumeSeconds)}</>
          )}
        </p>

        {editingNote ? (
          <div className="flex gap-2">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What were you doing?"
              className="h-8 text-xs"
              autoFocus
            />
            <Button
              size="sm"
              disabled={busy}
              onClick={async () => {
                await patch({ note }, "Note saved");
                setEditingNote(false);
              }}
            >
              <Check aria-hidden />
            </Button>
          </div>
        ) : video.note ? (
          <button
            type="button"
            onClick={() => setEditingNote(true)}
            className="rounded-md border border-dashed p-2 text-left text-xs text-muted-foreground hover:bg-accent"
          >
            {video.note}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditingNote(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3" aria-hidden />
            Add a note
          </button>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <a href={watchHref} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" className="w-full">
              <ExternalLink aria-hidden />
              {video.resumeSeconds > 0 ? "Resume" : "Watch"}
            </Button>
          </a>

          <Button
            size="sm"
            variant={video.watched ? "secondary" : "outline"}
            disabled={busy}
            title={video.watched ? "Mark as unwatched" : "Mark as watched"}
            onClick={() =>
              patch(
                { watched: !video.watched },
                video.watched ? "Marked unwatched" : "Marked watched"
              )
            }
          >
            <Check aria-hidden />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={remove}
            aria-label="Remove saved video"
            className="text-muted-foreground hover:text-destructive"
          >
            {busy ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SavedVideosView() {
  const { courseId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const chapter = searchParams.get("chapter");
  const topic = searchParams.get("topic");
  const topicName = searchParams.get("topicName");

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ courseId });
      if (chapter !== null) params.set("chapter", chapter);
      if (topic !== null) params.set("topic", topic);

      const response = await fetch(`/api/saved-videos?${params.toString()}`);
      const data = await response.json();
      setVideos(data.data ?? []);
    } catch (error) {
      console.error("Failed to load saved videos:", error);
      toast.error("Could not load your saved videos.");
    } finally {
      setLoading(false);
    }
  }, [courseId, chapter, topic]);

  useEffect(() => {
    load();
  }, [load]);

  const scopeLabel =
    topic !== null && chapter !== null
      ? topicName
        ? `${topicName} · Chapter ${Number(chapter) + 1}`
        : `Chapter ${Number(chapter) + 1}, topic ${Number(topic) + 1}`
      : chapter !== null
        ? `Chapter ${Number(chapter) + 1}`
        : "This course";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-3 md:px-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft aria-hidden />
          Back
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Saved videos</p>
        </div>

        {/* Widen the scope when looking at a single topic. */}
        {topic !== null && (
          <Link href={`/course/${courseId}/saved`}>
            <Button variant="ghost" size="sm">
              All in this course
            </Button>
          </Link>
        )}
      </header>

      <div className="mx-auto max-w-6xl p-5 md:p-7">
        <h1 className="text-2xl font-bold break-words">Saved videos</h1>
        <p className="mt-1 text-sm text-muted-foreground">{scopeLabel}</p>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border">
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
              <Bookmark className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
              <h2 className="font-semibold">Nothing saved here yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Open a topic&apos;s videos and save any you want to come back to.
                They&apos;ll be listed here with the point you stopped at.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                <ArrowLeft aria-hidden />
                Back to the course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => (
                <SavedVideoCard key={video.id} video={video} onChange={load} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// useSearchParams needs a Suspense boundary in the app router.
export default function SavedVideosPage() {
  return (
    <Suspense fallback={null}>
      <SavedVideosView />
    </Suspense>
  );
}
