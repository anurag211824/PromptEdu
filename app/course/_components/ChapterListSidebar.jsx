"use client";
import React, { useContext, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SelectedChapterIndex } from "@/contexts/SelectedChapterIndex";

function ChapterListSidebar({ courseInfo }) {
  const { setSelectedChapterIndex } = useContext(SelectedChapterIndex);
  console.log(courseInfo);

  // Safely handle completedChapters - ensure it's always an array
  const completedChapterArray = Array.isArray(
    courseInfo?.[0]?.enrollCourse?.completedChapters
  )
    ? courseInfo[0].enrollCourse.completedChapters
    : [];

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

  // Function to scroll to specific topic
  const scrollToTopic = (chapterIndex, topicIndex) => {
    // First set the chapter if it's different
    if (SelectedChapterIndex !== chapterIndex) {
      setSelectedChapterIndex(chapterIndex);
      // Wait a bit for the content to render
      setTimeout(() => {
        const topicElement = document.getElementById(
          `topic-${chapterIndex}-${topicIndex}`
        );
        if (topicElement) {
          topicElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } else {
      // Same chapter, scroll immediately
      const topicElement = document.getElementById(
        `topic-${chapterIndex}-${topicIndex}`
      );
      if (topicElement) {
        topicElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <>
      <div>
        <div className="flex flex-row items-center justify-between">
          <h2 className="my-3 font-bold text-xl">
            Chapters ({courseContent.length})
          </h2>
        </div>

        <Accordion type="single" collapsible>
          {courseContent.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No chapters available
            </div>
          ) : (
            courseContent.map((chapter, cIndex) => {
              const title =
                chapter?.courseData?.chapterName ??
                chapter?.chapterName ??
                chapter?.title ??
                `Chapter ${cIndex + 1}`;
              const chapterKey = chapter?.id ?? chapter?.cid ?? cIndex;
              let topics = chapter?.courseData?.topics ?? chapter?.topics ?? [];
              if (typeof topics === "string") {
                try {
                  const parsed = JSON.parse(topics);
                  topics = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  topics = [];
                }
              }
              if (!Array.isArray(topics)) topics = [];

              return (
                <AccordionItem
                  onClick={() => {
                    setSelectedChapterIndex(cIndex);
                  }}
                  key={chapterKey}
                  value={String(title) + "-" + chapterKey}
                >
                  <AccordionTrigger>{title}</AccordionTrigger>
                  <AccordionContent asChild>
                    <div className="space-y-2">
                      {topics.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          No topics available
                        </div>
                      ) : (
                        topics.map((t, tIndex) => {
                          // t may be a primitive or an object like { topic, content }
                          const topicTitle =
                            t?.topic ??
                            t?.title ??
                            (typeof t === "string" ? t : null);
                          const topicKey =
                            t?.id ?? t?.cid ?? `${chapterKey}-topic-${tIndex}`;

                          return (
                            <div
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent accordion toggle
                                scrollToTopic(cIndex, tIndex);
                              }}
                              key={topicKey}
                              className={`${
                                completedChapterArray.includes(cIndex)
                                  ? "bg-green-500 text-green-900"
                                  : ""
                              } p-2 border rounded`}
                            >
                              <h3 className="font-medium">
                                {topicTitle ?? `Topic ${tIndex + 1}`}
                              </h3>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })
          )}
        </Accordion>
      </div>
    </>
  );
}

export default ChapterListSidebar;
