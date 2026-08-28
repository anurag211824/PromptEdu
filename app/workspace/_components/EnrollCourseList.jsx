"use client";
import React, { useEffect, useState } from "react";
import EnrolledCourseCard from "./EnrolledCourseCard";
import CourseGridSkeleton from "./CourseGridSkeleton";
import { toast } from "sonner";

function EnrollCourseList() {
  const [loading, setLoading] = useState(true);
  const [enrolledCourseList, setEnrolledCourseList] = useState([]);
  const [courseRemoved, setCourseRemoved] = useState(false);

  const getEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/enroll-course");
      const response_data = await response.json();
      setEnrolledCourseList(response_data.data ?? []);
    } catch (error) {
      console.error("Failed to load enrolled courses:", error);
      toast.error("Could not load your courses. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, [courseRemoved]);

  if (loading) {
    return (
      <section className="mt-8">
        <div className="mb-4 h-7 w-56 animate-pulse rounded bg-muted" />
        <CourseGridSkeleton count={3} />
      </section>
    );
  }

  if (enrolledCourseList.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-1 text-xl font-bold">Continue learning</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Pick up where you left off.
      </p>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {enrolledCourseList.map((course, index) => (
          <EnrolledCourseCard
            key={course?.enrollCourse?.id ?? index}
            setCourseRemoved={setCourseRemoved}
            course={course?.courses}
            enrollcourse={course?.enrollCourse}
          />
        ))}
      </div>
    </section>
  );
}

export { EnrollCourseList };
export default EnrollCourseList;
