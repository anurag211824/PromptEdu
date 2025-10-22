"use client";
import React, { useContext, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SelectedChapterIndex } from "@/contexts/SelectedChapterIndex";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/contexts/ThemeContext";

function ChapterListSidebar({ courseInfo }) {
  const { setSelectedChapterIndex } = useContext(SelectedChapterIndex);
  const { themeMode } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
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
  console.log(courseContent);

  return (
    <>
      <div
        
      >
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
                    setIsOpen(false);
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
                            <div key={topicKey} className="p-2 border rounded">
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
