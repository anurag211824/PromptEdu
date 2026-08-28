"use client";
import React, { useContext, useEffect, useState } from "react";
import ThemeProvider, { ThemeContext } from "@/contexts/ThemeContext";
import ChapterListSidebar from "../_components/ChapterListSidebar";
import ChapterContent from "../_components/ChapterContent";
import { useParams, useRouter } from "next/navigation";
import SelectedChapterIndexProvider from "@/contexts/SelectedChapterIndex";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@clerk/nextjs";
import { ArrowLeft, Menu, Moon, Sun, X } from "lucide-react";
import { getChapters, getCompletedChapters } from "../_components/courseContent";

function CourseSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-10">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-8 w-3/4" />
      <Skeleton className="mt-5 h-9 w-40" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={i % 4 === 0 ? "h-5 w-1/2" : "h-4 w-full"} />
        ))}
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { themeMode, toggleTheme } = useContext(ThemeContext);
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} theme`}
    >
      {themeMode === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

function CourseView() {
  const { courseId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getEnrolledCourseById = async () => {
    try {
      const response = await fetch("/api/enroll-course?courseId=" + courseId);
      const data = await response.json();
      setCourseInfo(data.data);
    } catch (error) {
      console.error("Failed to load course:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEnrolledCourseById();
  }, [courseId]);

  // Lock background scrolling while the mobile chapter drawer is open.
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const courseName =
    courseInfo?.[0]?.courses?.course_name ??
    courseInfo?.[0]?.courses?.courseJson?.course?.course_name ??
    "Course";
  const chapters = getChapters(courseInfo);
  const completed = getCompletedChapters(courseInfo);
  const progress = chapters.length
    ? Math.round((completed.length / chapters.length) * 100)
    : 0;

  return (
    <SelectedChapterIndexProvider>
      <ThemeProvider>
        <div className="flex h-screen flex-col">
          {/* Top bar */}
          <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 md:px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/workspace/view-course/" + courseId)}
            >
              <ArrowLeft aria-hidden />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open chapter list"
            >
              <Menu />
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold">{courseName}</h1>
              {chapters.length > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={progress} className="h-1 max-w-40" />
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {completed.length}/{chapters.length}
                  </span>
                </div>
              )}
            </div>

            <ThemeToggle />
            <UserButton />
          </header>

          <div className="flex min-h-0 flex-1">
            {/* Mobile backdrop */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden
              />
            )}

            {/* Chapter sidebar */}
            <aside
              className={`fixed inset-y-0 left-0 z-50 w-80 border-r bg-background transition-transform duration-200 md:static md:z-auto md:h-auto md:translate-x-0 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex h-14 items-center justify-between border-b px-4 md:hidden">
                <span className="text-sm font-semibold">Chapters</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close chapter list"
                >
                  <X />
                </Button>
              </div>
              <div className="h-[calc(100%-3.5rem)] md:h-full">
                <ChapterListSidebar
                  courseInfo={courseInfo}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </div>
            </aside>

            {/* Reading pane */}
            <main className="thin-scrollbar min-w-0 flex-1 overflow-y-auto">
              {loading ? (
                <CourseSkeleton />
              ) : (
                <ChapterContent
                  courseInfo={courseInfo}
                  refreshData={getEnrolledCourseById}
                />
              )}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </SelectedChapterIndexProvider>
  );
}

export default CourseView;
