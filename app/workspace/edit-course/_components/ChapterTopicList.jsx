import { Gift } from "lucide-react";
import React from "react";

/**
 * Vertical timeline of a course's chapters and topics.
 *
 * On desktop the topics alternate left and right of the spine. On mobile that
 * layout cannot fit, so the spine moves left and every topic reads on one side.
 * The topic text is rendered once and placed with grid columns - rendering it
 * twice (once transparent) forced every row to twice its needed width.
 */
function ChapterTopicList({ course }) {
  const courseLayout = course?.courseJson?.course;
  const chapters = courseLayout?.chapters ?? [];

  const line = <div className="h-10 w-1 shrink-0 bg-gray-300" />;

  return (
    <div className="mt-3">
      <h2 className="text-2xl font-bold md:text-3xl">Chapters &amp; Topics</h2>

      <div className="mt-10 flex flex-col items-center">
        {chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="flex w-full flex-col items-center">
            {/* Chapter header card */}
            <div className="w-full max-w-md rounded-xl border bg-primary p-4 text-white shadow">
              <h3 className="text-center text-sm">Chapter {chapterIndex + 1}</h3>
              <h4 className="text-center text-lg font-bold break-words">
                {chapter?.chapterName}
              </h4>
              <div className="mt-1 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs sm:justify-between">
                <span>Duration: {chapter?.duration}</span>
                <span>Topics: {chapter?.topics?.length}</span>
              </div>
            </div>

            {/* Topics */}
            <div className="flex w-full flex-col items-center">
              {(chapter?.topics ?? []).map((topic, topicIndex) => {
                const onLeft = topicIndex % 2 === 0;
                const isLast = topicIndex === chapter.topics.length - 1;

                return (
                  <div
                    key={topicIndex}
                    className="flex w-full flex-col items-center"
                  >
                    {line}

                    <div className="grid w-full max-w-2xl grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                      {/* Left slot - desktop only */}
                      <span className="hidden break-words text-right text-sm md:block">
                        {onLeft ? topic : null}
                      </span>

                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-300 text-gray-600">
                        {topicIndex + 1}
                      </span>

                      {/* Right slot - always used on mobile */}
                      <span className="break-words text-sm">
                        <span className="md:hidden">{topic}</span>
                        <span className="hidden md:inline">
                          {onLeft ? null : topic}
                        </span>
                      </span>
                    </div>

                    {isLast && (
                      <>
                        {line}
                        <Gift className="h-14 w-14 shrink-0 rounded-full bg-gray-300 p-4 text-gray-500" />
                        {line}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-xl border bg-green-600 p-4 text-white shadow">
          <h2>Finish</h2>
        </div>
      </div>
    </div>
  );
}

export default ChapterTopicList;
