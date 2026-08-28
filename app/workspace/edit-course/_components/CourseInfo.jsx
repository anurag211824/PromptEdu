"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Book,
  Loader2Icon,
  PlayCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

function CourseInfo({ course, viewCourse }) {
  const courseLayout = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateCourseContent = async () => {
    try {
      setLoading(true);
      // Every chapter is a separate model call, so this legitimately takes a while.
      toast.info("Generating your course content. This can take a minute…");

      const response = await fetch("/api/generate-course-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseLayout,
          courseTitle: course?.course_name,
          courseId: course?.cid,
        }),
      });

      const response_data = await response.json();
      if (response_data.success) {
        const { failedChapters = [], generatedChapters, totalChapters } = response_data;

        if (failedChapters.length > 0) {
          toast.warning(
            `Generated ${generatedChapters} of ${totalChapters} chapters. ${failedChapters.length} failed — re-run to fill them in.`
          );
        } else {
          toast.success("Course ready — enroll to start learning");
        }
        router.replace("/workspace");
      } else {
        toast.error(response_data.error ?? "Content generation failed. Please try again.");
      }
    } catch (error) {
      console.error("Failed to generate course content:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <div className="flex flex-col gap-6 rounded-xl border p-5 md:flex-row">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="grid gap-4 pt-3 md:grid-cols-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-[240px] w-full md:w-[32%]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border bg-card p-5 md:flex-row md:justify-between">
      <div className="flex w-full flex-col gap-3 md:w-[65%]">
        <h1 className="text-2xl font-bold md:text-3xl">
          {courseLayout?.course_name ?? course?.course_name}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {courseLayout?.course_description ?? course?.course_description}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Book className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
            <div>
              <p className="text-xs text-muted-foreground">Chapters</p>
              <p className="font-semibold">{course?.chapters_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <TrendingUp className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="text-xs text-muted-foreground">Difficulty</p>
              <p className="font-semibold capitalize">{course?.difficulty}</p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          {viewCourse ? (
            <Link href={"/course/" + course?.cid}>
              <Button className="w-full">
                <PlayCircle aria-hidden />
                Continue Learning
              </Button>
            </Link>
          ) : (
            <>
              <Button
                onClick={generateCourseContent}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2Icon className="animate-spin" aria-hidden />
                ) : (
                  <Sparkles aria-hidden />
                )}
                {loading ? "Generating content…" : "Generate Content"}
              </Button>
              {loading && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Writing lessons for all {course?.chapters_number} chapters —
                  please keep this tab open.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {course?.bannerImageUrl ? (
        <Image
          src={course.bannerImageUrl}
          alt=""
          width={400}
          height={280}
          className="h-[240px] w-full rounded-lg bg-muted object-fill md:w-[32%]"
        />
      ) : (
        <div className="h-[240px] w-full animate-pulse rounded-lg bg-muted md:w-[32%]" />
      )}
    </div>
  );
}

export default CourseInfo;
