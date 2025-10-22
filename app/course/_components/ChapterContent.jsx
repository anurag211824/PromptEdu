"use client";
import { SelectedChapterIndex } from "@/contexts/SelectedChapterIndex";
import React, { useContext, useEffect } from "react";
import YouTube from "react-youtube";

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

function ChapterContent({ courseInfo }) {
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

  return (
    <div className="flex flex-col">
      <div className="p-5">
        <h2 className="text-2xl font-bold">
          {courseContent[selectedChapterIndex]?.courseData?.chapterName}
        </h2>

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
    {chapterTopicsData?.length > 0 ? (
      chapterTopicsData.map((item, index) => (
        <div key={index} className="border p-4 rounded-lg my-3 shadow">
          <h3 className="font-bold text-lg mb-2">{index + 1}.{item.topic}</h3>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: item.content }}
            style={{lineHeight:"2"}}
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
