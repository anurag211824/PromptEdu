"use client";
import React, { useContext } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { SelectedChapterIndex } from "@/contexts/SelectedChapterIndex";
import { CheckCircle2, Circle } from "lucide-react";
import {
  getChapterName,
  getChapters,
  getCompletedChapters,
  getTopicName,
  getTopics,
} from "./courseContent";

function ChapterListSidebar({ courseInfo, onNavigate }) {
  const { selectedChapterIndex, setSelectedChapterIndex } =
    useContext(SelectedChapterIndex);

  const chapters = getChapters(courseInfo);
  const completedChapters = getCompletedChapters(courseInfo);
  const progress = chapters.length
    ? Math.round((completedChapters.length / chapters.length) * 100)
    : 0;

  const goToTopic = (chapterIndex, topicIndex) => {
    setSelectedChapterIndex(chapterIndex);
    onNavigate?.();

    // Let the chapter render before scrolling to the topic within it.
    setTimeout(() => {
      document
        .getElementById(`topic-${chapterIndex}-${topicIndex}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Course progress */}
      <div className="shrink-0 border-b px-4 py-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Your progress</h2>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <p className="mt-2 text-xs text-muted-foreground">
          {completedChapters.length} of {chapters.length} chapters complete
        </p>
      </div>

      {/* Chapter list */}
      <nav
        aria-label="Course chapters"
        className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-3"
      >
        {chapters.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            No chapters available yet.
          </p>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={String(selectedChapterIndex)}
            onValueChange={(value) => {
              if (value !== "") setSelectedChapterIndex(Number(value));
            }}
          >
            {chapters.map((chapter, cIndex) => {
              const isActive = cIndex === selectedChapterIndex;
              const isComplete = completedChapters.includes(cIndex);
              const topics = getTopics(chapter);

              return (
                <AccordionItem
                  key={cIndex}
                  value={String(cIndex)}
                  className="border-b-0"
                >
                  <AccordionTrigger
                    className={`rounded-md px-2 py-2.5 text-left hover:no-underline ${
                      isActive ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      {isComplete ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          Chapter {cIndex + 1}
                        </div>
                        <div
                          className={`text-sm leading-snug ${
                            isActive ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {getChapterName(chapter, cIndex)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-2 pl-4 pr-1 pt-1">
                    {topics.length === 0 ? (
                      <p className="px-2 py-1 text-xs text-muted-foreground">
                        No topics available.
                      </p>
                    ) : (
                      <ul className="space-y-0.5 border-l pl-3">
                        {topics.map((topic, tIndex) => (
                          <li key={tIndex}>
                            <button
                              type="button"
                              onClick={() => goToTopic(cIndex, tIndex)}
                              className="w-full rounded px-2 py-1.5 text-left text-[13px] leading-snug text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                              {getTopicName(topic, tIndex)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </nav>
    </div>
  );
}

export default ChapterListSidebar;
