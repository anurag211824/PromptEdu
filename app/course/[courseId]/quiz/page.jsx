"use client";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2Icon,
  RefreshCw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { formatTimestamp } from "@/lib/formatTime";

const LETTERS = ["A", "B", "C", "D"];
const CONFETTI_COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899"];

/** Brief burst of falling pieces, rendered only on a strong score. */
function Confetti({ count = 70 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.2 + Math.random() * 1.4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [count]
  );

  return (
    <div aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="quiz-confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Animated circular score ring. */
function ScoreRing({ score, total }) {
  const radius = 78;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const pct = total ? score / total : 0;
  const offset = circumference * (1 - pct);

  const color =
    pct >= 0.8 ? "#22c55e" : pct >= 0.5 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative h-48 w-48">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="quiz-ring-progress"
          style={{
            "--ring-circumference": circumference,
            "--ring-offset": offset,
            strokeDashoffset: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums">
          {Math.round(pct * 100)}%
        </span>
        <span className="text-sm text-muted-foreground">
          {score} of {total}
        </span>
      </div>
    </div>
  );
}

function QuizView() {
  const { courseId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const chapter = searchParams.get("chapter");
  const topic = searchParams.get("topic");
  const topicName = searchParams.get("topicName") ?? "";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(false);

  const startedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setQuestions([]);
      setCurrent(0);
      setSelected(null);
      setAnswers([]);
      setFinished(false);

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          chapterIndex: Number(chapter),
          topicIndex: Number(topic),
        }),
      });
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        startedAt.current = Date.now();
      } else {
        setError(data.error ?? "Could not build the quiz.");
      }
    } catch (err) {
      console.error("Quiz load failed:", err);
      setError("Could not build the quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [courseId, chapter, topic]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // Running timer, stopped once the quiz is finished.
  useEffect(() => {
    if (loading || finished) return;
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [loading, finished]);

  const question = questions[current];
  const answered = selected !== null;
  const isCorrect = answered && selected === question?.correctIndex;
  const score = answers.filter((a) => a.correct).length;

  const choose = useCallback(
    (index) => {
      if (selected !== null || !question) return;
      setSelected(index);
      const correct = index === question.correctIndex;
      if (!correct) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
      setAnswers((prev) => [...prev, { questionIndex: current, chosen: index, correct }]);
    },
    [selected, question, current]
  );

  const next = useCallback(() => {
    if (selected === null) return;
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }, [selected, current, questions.length]);

  // Keyboard: 1-4 (or A-D) to answer, Enter/Space to advance.
  useEffect(() => {
    if (loading || finished) return;

    const onKey = (event) => {
      const key = event.key.toUpperCase();
      const numeric = "1234".indexOf(event.key);
      const letter = LETTERS.indexOf(key);

      if (numeric !== -1) {
        event.preventDefault();
        choose(numeric);
      } else if (letter !== -1) {
        event.preventDefault();
        choose(letter);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        next();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, finished, choose, next]);

  const backHref = () => router.back();

  /* ------------------------------------------------------------- loading */
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="relative">
          <Sparkles className="h-12 w-12 animate-pulse text-blue-500" aria-hidden />
        </div>
        <div>
          <p className="text-lg font-semibold">Building your quiz</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Writing 10 questions on {topicName || "this topic"}…
          </p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded bg-muted"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------- error */
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-semibold">Couldn&apos;t build the quiz</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        <div className="flex gap-2">
          <Button onClick={loadQuiz}>
            <RefreshCw aria-hidden />
            Try again
          </Button>
          <Button variant="outline" onClick={backHref}>
            <ArrowLeft aria-hidden />
            Back
          </Button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- results */
  if (finished) {
    const pct = questions.length ? score / questions.length : 0;
    const message =
      pct === 1
        ? "Perfect score."
        : pct >= 0.8
          ? "Strong understanding."
          : pct >= 0.5
            ? "A decent start — worth another pass."
            : "Worth re-reading this topic.";

    return (
      <div className="min-h-screen">
        {pct >= 0.8 && <Confetti />}

        <div className="mx-auto max-w-3xl px-5 py-12 md:px-8">
          <div className="animate-quiz-slide-up flex flex-col items-center text-center">
            <Trophy
              className={`mb-4 h-10 w-10 ${
                pct >= 0.8 ? "text-amber-500" : "text-muted-foreground"
              }`}
              aria-hidden
            />
            <h1 className="text-2xl font-bold">Quiz complete</h1>
            <p className="mt-1 text-sm text-muted-foreground">{topicName}</p>

            <div className="my-8">
              <ScoreRing score={score} total={questions.length} />
            </div>

            <p className="text-lg font-medium">{message}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Finished in {formatTimestamp(elapsed)}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={loadQuiz}>
                <RefreshCw aria-hidden />
                New quiz
              </Button>
              <Button variant="outline" onClick={backHref}>
                <ArrowLeft aria-hidden />
                Back to the topic
              </Button>
            </div>
          </div>

          {/* Review */}
          <div className="mt-14">
            <h2 className="mb-4 text-lg font-semibold">Review</h2>
            <ol className="space-y-4">
              {questions.map((q, i) => {
                const answer = answers.find((a) => a.questionIndex === i);
                const correct = answer?.correct;

                return (
                  <li
                    key={i}
                    className={`animate-quiz-slide-up rounded-xl border p-4 ${
                      correct
                        ? "border-green-500/40 bg-green-500/5"
                        : "border-red-500/40 bg-red-500/5"
                    }`}
                    style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          correct
                            ? "bg-green-500/20 text-green-600 dark:text-green-500"
                            : "bg-red-500/20 text-red-600 dark:text-red-500"
                        }`}
                      >
                        {correct ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {i + 1}. {q.question}
                        </p>

                        {!correct && answer && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                            You chose: {q.options[answer.chosen]}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                          Correct: {q.options[q.correctIndex]}
                        </p>
                        {q.explanation && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------ question */
  const progress = ((current + (answered ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="flex h-14 items-center gap-3 px-3 md:px-4">
          <Button variant="ghost" size="sm" onClick={backHref}>
            <ArrowLeft aria-hidden />
            <span className="hidden sm:inline">Exit</span>
          </Button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{topicName || "Quiz"}</p>
          </div>

          <span className="text-xs tabular-nums text-muted-foreground">
            {formatTimestamp(elapsed)}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums">
            {score}/{questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Question {current + 1} of {questions.length}
        </p>

        <div key={current} className="animate-quiz-slide-up">
          <h1 className="mt-2 text-xl font-bold leading-snug md:text-2xl">
            {question?.question}
          </h1>

          <ul className="mt-7 space-y-3">
            {question?.options.map((option, index) => {
              const isChosen = selected === index;
              const isAnswer = index === question.correctIndex;

              // Before answering: neutral. After: reveal correct, mark the
              // wrong pick, fade everything else back.
              let tone =
                "border-border hover:border-blue-500/60 hover:bg-accent";
              if (answered) {
                if (isAnswer) {
                  tone = "border-green-500 bg-green-500/10";
                } else if (isChosen) {
                  tone = "border-red-500 bg-red-500/10";
                } else {
                  tone = "border-border opacity-50";
                }
              }

              return (
                <li key={index}>
                  <button
                    type="button"
                    disabled={answered}
                    onClick={() => choose(index)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all disabled:cursor-default ${tone} ${
                      isChosen && !isAnswer && shake ? "animate-quiz-shake" : ""
                    } ${isAnswer && answered ? "animate-quiz-pop" : ""}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        answered && isAnswer
                          ? "bg-green-500 text-white"
                          : answered && isChosen
                            ? "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {answered && isAnswer ? (
                        <Check className="h-4 w-4" />
                      ) : answered && isChosen ? (
                        <X className="h-4 w-4" />
                      ) : (
                        LETTERS[index]
                      )}
                    </span>
                    <span className="min-w-0 flex-1 text-sm md:text-base">
                      {option}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {answered && (
            <div
              className={`animate-quiz-slide-up mt-6 rounded-xl border p-4 ${
                isCorrect
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-red-500/40 bg-red-500/5"
              }`}
            >
              <p className="text-sm font-semibold">
                {isCorrect ? "Correct" : "Not quite"}
              </p>
              {question.explanation && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {question.explanation}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {answered
                ? "Press Enter to continue"
                : "Press 1–4 or A–D to answer"}
            </p>
            <Button
              onClick={next}
              disabled={!answered}
              size="lg"
              className="w-full sm:w-auto"
            >
              {current + 1 >= questions.length ? "See results" : "Next question"}
              <ArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizView />
    </Suspense>
  );
}
