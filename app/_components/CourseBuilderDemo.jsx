"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, Loader2, Sparkles, Youtube } from "lucide-react";

/**
 * A self-running mock of the real course pipeline: a topic is typed in, the
 * layout is "generated", then chapters land one by one. Visitors can click a
 * topic chip to restart it with a different subject.
 */
const TOPICS = [
  {
    prompt: "Advanced Java Features",
    chapters: [
      "Generics and Type Safety",
      "Collections Framework",
      "Exception Handling",
      "Streams and Lambdas",
      "Concurrency Basics",
    ],
  },
  {
    prompt: "Intro to Machine Learning",
    chapters: [
      "What Machine Learning Is",
      "Supervised vs Unsupervised",
      "Training and Test Splits",
      "Evaluating a Model",
      "Your First Classifier",
    ],
  },
  {
    prompt: "Database Systems",
    chapters: [
      "The Relational Model",
      "SQL Fundamentals",
      "Normalization",
      "Indexing and Query Plans",
      "Transactions and ACID",
    ],
  },
];

const TYPING_SPEED = 55;
const GENERATING_MS = 900;
const CHAPTER_STAGGER = 260;

function CourseBuilderDemo() {
  const [topicIndex, setTopicIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing -> generating -> done
  const [chaptersShown, setChaptersShown] = useState(0);
  const timers = useRef([]);

  const topic = TOPICS[topicIndex];

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const schedule = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => {
    clearTimers();

    // Respect reduced motion by jumping straight to the finished state.
    if (reducedMotion) {
      setTyped(topic.prompt);
      setPhase("done");
      setChaptersShown(topic.chapters.length);
      return;
    }

    setTyped("");
    setPhase("typing");
    setChaptersShown(0);

    topic.prompt.split("").forEach((_, i) => {
      schedule(() => setTyped(topic.prompt.slice(0, i + 1)), TYPING_SPEED * (i + 1));
    });

    const afterTyping = TYPING_SPEED * topic.prompt.length + 350;
    schedule(() => setPhase("generating"), afterTyping);
    schedule(() => setPhase("done"), afterTyping + GENERATING_MS);

    topic.chapters.forEach((_, i) => {
      schedule(
        () => setChaptersShown(i + 1),
        afterTyping + GENERATING_MS + CHAPTER_STAGGER * i
      );
    });

    // Move on to the next topic once this one has been on screen for a beat.
    const total =
      afterTyping +
      GENERATING_MS +
      CHAPTER_STAGGER * topic.chapters.length +
      4200;
    schedule(() => setTopicIndex((i) => (i + 1) % TOPICS.length), total);

    return clearTimers;
  }, [topicIndex, reducedMotion, topic]);

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur-sm">
      {/* Fake window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
        <span className="ml-2 text-xs text-slate-400">Create a new course</span>
      </div>

      <div className="space-y-4 p-5">
        {/* Prompt field */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            What do you want to learn?
          </label>
          <div className="flex min-h-11 items-center rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100">
            <span>{typed}</span>
            {phase === "typing" && (
              <span className="animate-caret ml-0.5 inline-block h-4 w-0.5 bg-blue-400" />
            )}
          </div>
        </div>

        {/* Generate button */}
        <div
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
            phase === "typing" ? "bg-blue-600/40" : "bg-blue-600"
          }`}
        >
          {phase === "generating" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating course…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate course
            </>
          )}
        </div>

        {/* Generated chapters */}
        <div className="min-h-[228px] space-y-2 pt-1">
          {topic.chapters.slice(0, chaptersShown).map((chapter, i) => (
            <div
              key={`${topicIndex}-${chapter}`}
              className="animate-pop-in flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2.5"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-[11px] font-semibold text-blue-300">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                {chapter}
              </span>
              <Youtube className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
              <Check className="h-3.5 w-3.5 shrink-0 text-green-400" aria-hidden />
            </div>
          ))}

          {chaptersShown === 0 && phase !== "typing" && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <BookOpen className="h-4 w-4" />
              Writing your chapters…
            </div>
          )}
        </div>

        {/* Topic switcher */}
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {TOPICS.map((t, i) => (
            <button
              key={t.prompt}
              type="button"
              onClick={() => setTopicIndex(i)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                i === topicIndex
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {t.prompt.split("—")[0].trim()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseBuilderDemo;
