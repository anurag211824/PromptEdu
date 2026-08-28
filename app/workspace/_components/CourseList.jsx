"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddNewCourseDialog from "./AddNewCourseDialog";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";
import CourseGridSkeleton from "./CourseGridSkeleton";
import { toast } from "sonner";

function CourseList({ onCourseEnrolled }) {
  const [courseList, setCourseList] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) getCourseList();
  }, [user]);

  const getCourseList = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");
      const result = await response.json();
      if (result.success) setCourseList(result.data ?? []);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Could not load your courses. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="mb-1 text-xl font-bold">Your courses</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Courses you&apos;ve created with AI.
      </p>

      {loading ? (
        <CourseGridSkeleton count={3} />
      ) : courseList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
          <Image
            src="/online-edu.png"
            alt=""
            width={260}
            height={195}
            className="mb-4 opacity-90"
          />
          <h3 className="text-lg font-semibold">No courses yet</h3>
          <p className="mb-5 mt-1 max-w-sm text-sm text-muted-foreground">
            Describe any topic and PromptEdu will build a full course for you —
            chapters, lessons and videos included.
          </p>
          <AddNewCourseDialog>
            <Button>+ Create your first course</Button>
          </AddNewCourseDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {courseList.map((course, index) => (
            <CourseCard
              course={course}
              key={course?.cid ?? index}
              onCourseEnrolled={onCourseEnrolled}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CourseList;
