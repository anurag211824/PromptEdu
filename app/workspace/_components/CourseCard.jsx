"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookOpen, BuildingIcon, LoaderCircle, PlayCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function CourseCard({ course, onCourseEnrolled }) {
  const [loading, setLoading] = useState(false);

  const courseJson = course?.courseJson?.course;
  const courseName = courseJson?.course_name ?? course?.course_name ?? "Untitled course";
  const courseDescription =
    courseJson?.course_description ?? course?.course_description ?? "";

  // A course is only enrollable once its chapter content has been generated.
  const hasContent = Array.isArray(course?.courseContent)
    ? course.courseContent.length > 0
    : Object.keys(course?.courseContent ?? {}).length > 0;

  const onEnrollCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/enroll-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course?.id }),
      });

      const response_data = await response.json();
      if (response_data?.success === true) {
        toast.success(`Enrolled in ${courseName}`);
        onCourseEnrolled?.();
      } else {
        const msg =
          typeof response_data?.data === "string"
            ? response_data.data
            : response_data?.data?.message || "Could not enroll. Please try again.";
        toast.error(msg);
      }
    } catch (error) {
      console.error("Enroll failed:", error);
      toast.error("Could not enroll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      {course?.bannerImageUrl ? (
        <Image
          src={course.bannerImageUrl}
          alt=""
          width={400}
          height={225}
          className="aspect-video w-full bg-muted object-fill"
        />
      ) : (
        <div className="aspect-video w-full bg-muted" />
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <h2 className="line-clamp-1 font-semibold">{courseName}</h2>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {courseDescription}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {course?.chapters_number} chapters
          </span>

          {hasContent ? (
            <Button size="sm" disabled={loading} onClick={onEnrollCourse}>
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <PlayCircle aria-hidden />
              )}
              Enroll
            </Button>
          ) : (
            <Link href={`/workspace/edit-course/${course?.cid}`}>
              <Button size="sm" variant="outline">
                <BuildingIcon aria-hidden />
                Generate content
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
