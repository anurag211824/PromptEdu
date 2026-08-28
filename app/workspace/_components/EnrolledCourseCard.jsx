"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoaderCircle, PlayCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

function EnrolledCourseCard({ course, enrollcourse, setCourseRemoved }) {
  const [loading, setLoading] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const removeEnrolledCourse = async (id) => {
    try {
      setLoading(true);
      const response = await fetch("/api/enroll-course", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (!result.success) {
        toast.error("Could not remove the course. Please try again.");
        console.error(result.error);
        return;
      }

      toast.success("Course removed");
      setCourseRemoved((prev) => !prev);
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Could not remove the course. Please try again.");
    } finally {
      setLoading(false);
      setConfirmingRemove(false);
    }
  };

  const completed = Array.isArray(enrollcourse?.completedChapters)
    ? enrollcourse.completedChapters.length
    : 0;
  const total = Array.isArray(course?.courseContent)
    ? course.courseContent.length
    : 0;
  const progress = total
    ? Math.min(100, Math.max(0, Math.round((completed / total) * 100)))
    : 0;

  const courseHref = "/course/" + course?.cid;
  const isStarted = progress > 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      {/* Only the banner and title navigate, so the footer actions stay unambiguous. */}
      <Link href={courseHref} className="block">
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
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <Link href={courseHref}>
            <h2 className="line-clamp-1 font-semibold group-hover:underline">
              {course?.course_name}
            </h2>
          </Link>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {course?.course_description}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {completed} of {total} chapters
              </span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          <div className="flex items-center gap-2">
            <Link href={courseHref} className="flex-1">
              <Button className="w-full">
                <PlayCircle aria-hidden />
                {isStarted ? "Continue" : "Start learning"}
              </Button>
            </Link>

            {confirmingRemove ? (
              <div className="flex gap-1.5">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loading}
                  onClick={() => removeEnrolledCourse(enrollcourse.id)}
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={() => setConfirmingRemove(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmingRemove(true)}
                aria-label={`Remove ${course?.course_name} from your courses`}
                title="Remove course"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnrolledCourseCard;
