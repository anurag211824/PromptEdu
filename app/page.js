import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Code2,
  FileText,
  ListChecks,
  MoonStar,
  PlayCircle,
  Sparkles,
  Wand2,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import LandingNav from "./_components/LandingNav";
import CourseBuilderDemo from "./_components/CourseBuilderDemo";
import Reveal from "./_components/Reveal";

const STEPS = [
  {
    icon: FileText,
    title: "Describe what you want to learn",
    body: "Give it a topic and pick how deep you want to go. That's the whole setup.",
  },
  {
    icon: Wand2,
    title: "The structure gets built",
    body: "Gemini drafts the course — chapters, the topics inside each one, a description and a cover image.",
  },
  {
    icon: BookOpen,
    title: "Lessons, videos and quizzes",
    body: "Every topic is written out in full, matched with videos from YouTube, and backed by a quiz to test yourself.",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Courses from a single prompt",
    body: "Name any subject and get a complete, structured course back — not a list of links.",
  },
  {
    icon: Youtube,
    title: "Videos on every chapter",
    body: "Each chapter comes with hand-picked YouTube videos, and you can pull more for any single topic.",
  },
  {
    icon: BrainCircuit,
    title: "Quiz yourself on any topic",
    body: "Ten multiple-choice questions written from the lesson you just read, with instant feedback and explanations.",
  },
  {
    icon: ListChecks,
    title: "Progress that sticks",
    body: "Mark chapters complete, see how far through you are, and pick up exactly where you stopped.",
  },
  {
    icon: Code2,
    title: "Lessons built to be read",
    body: "Every topic follows the same shape — overview, key concepts, a worked example with highlighted code, takeaways.",
  },
  {
    icon: MoonStar,
    title: "Light, dark and mobile",
    body: "A reading view that works on a phone at the bus stop and a monitor at your desk.",
  },
];

const LESSON_SECTIONS = [
  "Overview",
  "Key Concepts",
  "How It Works",
  "Example",
  "Key Takeaways",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        {/* Drifting aurora blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="animate-aurora absolute -left-24 -top-32 h-[32rem] w-[32rem] rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/15" />
          <div
            className="animate-aurora absolute -right-24 top-10 h-[28rem] w-[28rem] rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-500/15"
            style={{ animationDelay: "-8s" }}
          />
          <div
            className="animate-aurora absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-400/10"
            style={{ animationDelay: "-15s" }}
          />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 md:px-6 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              Turn any topic into a{" "}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                full course
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Describe what you want to learn and PromptEdu writes the chapters,
              the lessons and the examples, finds the videos, and tracks how far
              you&apos;ve got.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SignedIn>
                <Link href="/workspace">
                  <Button size="lg" className="w-full sm:w-auto">
                    <PlayCircle aria-hidden />
                    Go to your dashboard
                  </Button>
                </Link>
              </SignedIn>

              <SignedOut>
                <Link href="/sign-up">
                  <Button size="lg" className="group w-full sm:w-auto">
                    Start building free
                    <ArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Button>
                </Link>
              </SignedOut>

              <Link href="/workspace/explore">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore courses
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              No credit card needed. Your first course takes about a minute.
            </p>
          </Reveal>

          <Reveal delay={150} className="flex justify-center lg:justify-end">
            <div className="animate-float-slow">
              <CourseBuilderDemo />
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- How it works */}
      <section id="how-it-works" className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              From a sentence to a syllabus
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three steps, and the longest one is waiting about a minute.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <div className="group relative h-full rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg">
                  <span className="absolute right-6 top-6 text-5xl font-bold leading-none text-muted-foreground/10 transition-colors group-hover:text-blue-500/20">
                    {i + 1}
                  </span>
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              What you actually get
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every course is generated, structured and tracked the same way.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={(i % 3) * 110}>
                <div className="group h-full rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors duration-300 group-hover:bg-blue-500/10">
                    <feature.icon
                      className="h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-blue-500"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- Lesson shape teaser */}
      <section className="border-y bg-muted/30 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 md:px-6 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Every lesson has the same spine
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Generated content is only useful if it&apos;s consistent. Each topic
              is written to a fixed structure, so you always know where the
              explanation ends and the example begins.
            </p>
            <ul className="mt-7 space-y-3">
              {LESSON_SECTIONS.map((section, i) => (
                <li key={section} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{section}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150}>
            <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              <div className="border-b px-5 py-3 text-xs text-muted-foreground">
                Chapter 4 · Exception Handling
              </div>
              <div className="space-y-4 p-6">
                <h3 className="text-base font-semibold">Example</h3>
                <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-[13px] leading-relaxed">
                  <code>
                    <span className="text-[color:var(--hl-keyword)]">try</span> {"{"}
                    {"\n  "}
                    <span className="text-[color:var(--hl-type)]">FileReader</span> f ={" "}
                    <span className="text-[color:var(--hl-keyword)]">new</span>{" "}
                    <span className="text-[color:var(--hl-function)]">FileReader</span>(
                    <span className="text-[color:var(--hl-string)]">
                      &quot;data.txt&quot;
                    </span>
                    );{"\n"}
                    {"}"}{" "}
                    <span className="text-[color:var(--hl-keyword)]">catch</span> (
                    <span className="text-[color:var(--hl-type)]">IOException</span> e) {"{"}
                    {"\n  "}
                    <span className="text-[color:var(--hl-comment)]">
                      {"// handle the failure"}
                    </span>
                    {"\n"}
                    {"}"}
                  </code>
                </pre>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Code samples come out syntax highlighted, in both light and dark.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950"
          aria-hidden
        />
        <Reveal className="mx-auto max-w-3xl px-4 text-center text-white md:px-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            What do you want to learn first?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Pick a topic, and have the whole course waiting for you in about a
            minute.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <SignedOut>
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="group w-full text-blue-700 sm:w-auto">
                  Create your first course
                  <ArrowRight
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/workspace">
                <Button size="lg" variant="secondary" className="w-full text-blue-700 sm:w-auto">
                  Create your next course
                </Button>
              </Link>
            </SignedIn>
            <Link href="/workspace/explore">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                Browse courses
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold">PromptEdu</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Turn any topic into a structured course with lessons, examples
                and videos.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/workspace" className="transition-colors hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/workspace/explore" className="transition-colors hover:text-foreground">
                    Explore courses
                  </Link>
                </li>
                <li>
                  <Link href="/workspace/my-learning" className="transition-colors hover:text-foreground">
                    My learning
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/sign-in" className="transition-colors hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="transition-colors hover:text-foreground">
                    Create an account
                  </Link>
                </li>
                <li>
                  <Link href="/workspace/billings" className="transition-colors hover:text-foreground">
                    Billing
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PromptEdu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
