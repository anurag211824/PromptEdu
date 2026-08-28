"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, LayoutDashboard, Youtube } from "lucide-react";

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

function YoutubeRelatedVideos() {
  const { topic } = useParams();
  const router = useRouter();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const topicLabel = topic ? decodeURIComponent(topic) : "";

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
  }, [topic]);

  const videoItems = videos.filter((v) => v?.id?.videoId);

  return (
    <div className="min-h-screen">
      {/* Header — this page is reached from inside a course, so getting back
          out of it needs to be obvious. */}
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

        <Link href="/workspace">
          <Button variant="ghost" size="sm">
            <LayoutDashboard aria-hidden />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </Link>
      </header>

      <div className="mx-auto max-w-6xl p-5 md:p-7">
        <h1 className="text-2xl font-bold">{topicLabel}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Videos from YouTube related to this topic.
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
              <Youtube className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="font-medium">No videos found</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Nothing came back for “{topicLabel}”. Try heading back and
                picking another topic.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                <ArrowLeft aria-hidden />
                Back to the course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videoItems.map((video, idx) => {
                const vid = video.id.videoId;
                const title = video.snippet?.title || "Untitled";
                const channel = video.snippet?.channelTitle || "";

                return (
                  <div
                    key={vid ?? idx}
                    className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-video w-full bg-black">
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${vid}`}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-3">
                      <h2
                        className="line-clamp-2 text-sm font-semibold leading-snug"
                        dangerouslySetInnerHTML={{ __html: title }}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">{channel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default YoutubeRelatedVideos;
