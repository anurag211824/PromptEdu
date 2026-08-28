# PromptEdu — Project Understanding

## Overview
An AI-powered course-creation platform. Users describe a topic (or paste a syllabus for "semester" courses), Gemini generates a course layout and banner image, and per-chapter content generation fills in HTML lessons plus relevant YouTube videos. Users enroll in courses, track chapter/topic completion, and view courses through a chapter sidebar + content viewer.

## Tech Stack
- **Framework**: Next.js 15.3.6 (App Router, Turbopack dev/build), React 19.1.0
- **Language**: JavaScript/JSX (no TypeScript; `jsconfig.json` provides `@/` path aliasing)
- **Styling**: Tailwind CSS 4, `tw-animate-css`, `next-themes` for dark/light mode, `class-variance-authority` + `tailwind-merge` (`lib/utils.js` `cn` helper)
- **UI components**: Radix UI primitives under `components/ui/` (shadcn convention, config in `components.json`); icons via `lucide-react`; toasts via `sonner`
- **Auth**: Clerk (`@clerk/nextjs`) — route protection in `middleware.js`, sign-in/sign-up under `app/(auth)/`
- **Database/ORM**: Drizzle ORM on Neon Postgres (serverless driver `@neondatabase/serverless`); config at `drizzle.config.js`, client at `config/db.jsx`, schema at `config/schema.js`
- **AI**: Google Gemini via `@google/genai` (model `gemini-2.5-flash`, fallback `gemini-1.5-flash`); `jsonrepair` fixes malformed AI JSON output; `openai` dependency present but appears unused
- **Other integrations**: YouTube Data API v3 (raw `fetch`), `react-youtube` player, Pollinations.ai for AI-generated banner images (whitelisted in `next.config.mjs`)
- **Misc**: `uuid`, `mime`, `dotenv`

## Project Structure
- `app/(auth)/sign-in`, `app/(auth)/sign-up` — Clerk auth pages
- `app/api/*` — backend API routes (see below)
- `app/workspace/` — authenticated dashboard: course list, enrollment, editing, semester courses, billing, profile (`layout.jsx` wraps sidebar/header)
- `app/course/[courseId]/` — course viewer with `ChapterContent.jsx` / `ChapterListSidebar.jsx`
- `app/youtube/[topic]/` — YouTube search/lookup page
- `app/layout.js`, `app/page.js` — root layout & landing page
- `components/ui/` — reusable shadcn/Radix-based primitives
- `config/` — `db.jsx` (Drizzle/Neon client), `schema.js` (table definitions)
- `contexts/` — `UserContext.jsx`, `ThemeContext.jsx`, `SelectedChapterIndex.jsx`
- `hooks/` — `use-mobile.js`
- `lib/utils.js` — className merge helper
- `middleware.js` — Clerk auth middleware; protects all routes except `/`, `/sign-in`, `/sign-up` (always runs on `/api`, `/trpc`)
- `drizzle.config.js` — Drizzle Kit config, `postgresql` dialect, targets `DATABASE_URL`

## Database Schema (`config/schema.js`)
- **`usersTable`**: `id`, `name`, `email` (unique), `subscription`
- **`coursesTable`**: `id`, `cid` (unique), `course_name`, `course_description`, `chapters_number`, `include_videos` (bool), `difficulty` (default `"semester"`), `category`, `courseJson` (json), `bannerImageUrl`, `courseContent` (json), `userEmail` (FK → users.email), `isSemesterCourse` (bool)
- **`enrollCourseTable`**: `id`, `courseId` (FK → courses.id), `userEmail` (FK → users.email), `completedChapters` (json)

## API Routes (`app/api/`)
- `GET /api/courses` — fetch one course by `cid`, or all courses for current user
- `POST/GET/PUT/DELETE /api/enroll-course` — enroll, list enrolled (joined with course data), update completed chapters, delete enrollment
- `POST /api/generate-course-layout` — Gemini generates course structure JSON, generates banner via Pollinations, inserts into `coursesTable`; per-user rate limit (20s); commented-out Ollama fallback present
- `POST /api/generate-course-content` — per chapter, Gemini generates HTML content JSON + fetches related YouTube videos, saves combined `courseContent`
- `GET /api/get-all-courses` — returns all courses (unfiltered)
- `POST /api/mark-topic-complete` — marks a topic complete within a chapter
- `POST /api/semester-course-layout` — like generate-course-layout, tailored to pasted syllabus + custom prompt, sets `isSemesterCourse: true`
- `GET/POST /api/user` — list users / upsert current Clerk user
- `GET /api/youtube-video` — standalone YouTube search by topic query param

## Config Notes
- `next.config.mjs`: whitelists `image.pollinations.ai` for `next/image`
- Env vars used: `DATABASE_URL`, `GEMINI_API_KEY`, `YOUTUBE_API_KEY`, plus standard Clerk keys (`NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`)

## Recent Work (per git log)
- `573a48d` / `c360bfe` / `d62772c` — built out Gemini-powered `generate-course-content` and `generate-course-layout` routes with YouTube video lookups; both routes still carry large commented-out Ollama/local-LLM alternative implementations, suggesting a migration from local Ollama to Gemini
- `b9061c2` — added direct navigation to course in `EnrolledCourseCard.jsx` (`Link href={"/course/" + course?.cid}`)
- Earlier commits fixed an API endpoint typo and added per-topic YouTube video fetching

## Known Issue / Risk
**Schema drift (open)**: `app/api/mark-topic-complete/route.js` reads/writes a `chapterWiseTopicsCompleted` field that does **not** exist in `config/schema.js` — the `enrollCourseTable` only has `completedChapters`. This still needs a fix (rename the field in code, or add the column via migration). Note the UI does not currently call this route; chapter completion goes through `PUT /api/enroll-course`.

## UI/UX Pass (2026-08-29)
A pass over the learner-facing UI. What changed and why:

**Lesson content formatting** — `ChapterContent` rendered AI HTML with Tailwind's `prose` class, but `@tailwindcss/typography` was never installed, so lessons rendered completely unstyled. Replaced with a self-contained `.lesson-prose` block in `app/globals.css` (headings, lists, inline code, code blocks, tables, blockquotes) built on the existing design tokens so dark mode works automatically. The generation prompt in `app/api/generate-course-content/route.js` was also rewritten from 8 vague lines to a strict schema requiring a consistent five-section structure per topic (Overview / Key Concepts / How It Works / Example / Key Takeaways).

**Course viewer flow** — added prev/next chapter navigation, a course-level progress bar in the top bar and sidebar, active-chapter highlighting, auto-scroll to top on chapter change, auto-advance after marking complete, skeleton loading, and a proper mobile drawer. Shared parsing helpers extracted to `app/course/_components/courseContent.js`.

**Bugs fixed along the way**
- `contexts/ThemeContext.jsx` applied the *previous* theme class (stale state), so the toggle was always one click behind; now also persists and respects the OS preference.
- `EnrolledCourseCard.jsx` nested a `<Link>` inside a `<Link>` and put "Remove Course" inside the card-wide link, so deleting also navigated. Now scoped links plus an inline confirm step.
- `EnrollCourseList.jsx` exported `GetEnrolledCourse`, a function that only exists inside the component.
- `AppSidebar.jsx` matched the active route with `path.includes("/workspace")`, which highlighted "Dashboard" on every page; also linked to `/workspace/ai-tools`, which has no page (link removed).
- `CourseCard.jsx` / `CourseInfo.jsx` crashed on courses with no `courseJson`, no `courseContent`, or no banner image.
- Full-height spinners on the dashboard (two stacked) replaced with skeletons that match the final layout.
