"use client";
import { Button } from "@/components/ui/button";
import { SelectedChapterIndex } from "@/contexts/SelectedChapterIndex";
import { CheckCircle, Loader2Icon, X } from "lucide-react";
import Link from "next/link";

import { useParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

function YouTubeEmbed({ videoId }) {
  return (
    <div className="aspect-video w-full max-w-[500px] mx-auto">
      <iframe
        className="w-full h-full rounded-lg "
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}

function ChapterContent({ courseInfo, refreshData }) {
  console.log(courseInfo);
  const enrollCourse = courseInfo?.[0]?.enrollCourse;
  console.log(enrollCourse);
  const [loading, setLoading] = useState(false);
  const { selectedChapterIndex, setSelectedChapterIndex } =
    useContext(SelectedChapterIndex);
  const rawContent =
    courseInfo?.[0]?.courses?.courseContent ??
    courseInfo?.[0]?.courseContent ??
    courseInfo?.courseContent ??
    null;

  // Normalize into an array safely
  let courseContent = [];

  if (rawContent) {
    if (typeof rawContent === "string") {
      try {
        const parsed = JSON.parse(rawContent);
        courseContent = Array.isArray(parsed) ? parsed : parsed?.chapters ?? [];
      } catch (e) {
        courseContent = [];
      }
    } else if (Array.isArray(rawContent)) {
      courseContent = rawContent;
    } else if (typeof rawContent === "object") {
      courseContent = rawContent?.chapters ?? Object.values(rawContent);
      if (!Array.isArray(courseContent)) courseContent = [];
    }
  }

  const youTubeVideos = Array.isArray(
    courseContent[selectedChapterIndex]?.YoutubeVideo
  )
    ? courseContent[selectedChapterIndex].YoutubeVideo
    : [];
  useEffect(() => {
    console.log(
      "Selected Chapter:",
      selectedChapterIndex,
      "Course Info:",
      courseInfo
    );
  }, [selectedChapterIndex, courseInfo]);
  const chapterTopicsData =
    courseContent[selectedChapterIndex]?.courseData?.topics;
  const markChapterComplted = async () => {
    try {
      const existing = Array.isArray(enrollCourse?.completedChapters)
        ? enrollCourse.completedChapters
        : [];

      const newCompleted = Array.from(
        new Set([...existing, selectedChapterIndex])
      );
      setLoading(true);
      const response = await fetch("/api/enroll-course", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: Number(courseInfo[0]?.courses?.id),
          completedChapters: newCompleted,
        }),
      });

      const data = await response.json();
      console.log("Update Response:", data);

      if (data.success) {
        toast.success("Marked Completed");
        setLoading(false);
        await refreshData();
      } else {
        console.error("Failed to update:", data.error);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating chapter:", error);
    }
  };
  const markChapterInComplted = async () => {
    try {
      const existing = Array.isArray(enrollCourse?.completedChapters)
        ? enrollCourse.completedChapters
        : [];

      const newCompleted = existing.filter(
        (item) => item != selectedChapterIndex
      );
      setLoading(true);
      const response = await fetch("/api/enroll-course", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: Number(courseInfo[0]?.courses?.id),
          completedChapters: newCompleted,
        }),
      });

      const data = await response.json();
      console.log("Update Response:", data);

      if (data.success) {
        toast.success("Marked InCompleted");
        setLoading(false);
        await refreshData();
      } else {
        console.error("Failed to update:", data.error);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating chapter:", error);
    }
  };
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"
            role="status"
            aria-label="Loading"
          />
          <span className="text-sm text-gray-700">Loading Courses...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <div className="p-5">
        <div className="flex flex-col md:flex-row items-center justify-between ">
          <h2 className="text-2xl font-bold mb-5">
            {courseContent[selectedChapterIndex]?.courseData?.chapterName}
          </h2>

          {enrollCourse?.completedChapters?.includes(selectedChapterIndex) ? (
            <Button
              className="w-full md:w-auto"
              onClick={markChapterInComplted}
              variant="outline"
            >
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <X className="mr-2" />
              )}
              Mark Incomplete
            </Button>
          ) : (
            <Button className="w-full md:w-auto" onClick={markChapterComplted}>
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <CheckCircle className="mr-2" />
              )}{" "}
              Mark Complete
            </Button>
          )}
        </div>

        <h2 className="my-2">Related Videos 📽️</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {youTubeVideos?.map((video, index) =>
            video?.videoId ? (
              <div
                key={index}
                className="w-full aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-xl transition"
              >
                <YouTubeEmbed videoId={video.videoId} />
              </div>
            ) : null
          )}
        </div>
      </div>
      {/* ---- Render Topics & Content ---- */}
      <h2 className="my-4 text-xl font-semibold">Chapter Topics 📚</h2>
      // ...existing code...
      {chapterTopicsData?.length > 0 ? (
        chapterTopicsData.map((item, index) => (
          <div
            key={index}
            id={`topic-${selectedChapterIndex}-${index}`}
            className="border p-4 rounded-lg my-3 shadow"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg mb-2">
                {index + 1}.{item.topic}
              </h3>
              <Link href={`/youtube/${item.topic}`}>
                <Button>Get Related Videos</Button>
              </Link>
            </div>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: item.content }}
              style={{ lineHeight: "2" }}
            ></div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No topics available.</p>
      )}
    </div>
  );
}

export default ChapterContent;
