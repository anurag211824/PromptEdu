"use client";
import React, { useEffect, useState } from "react";
import WelcomeBanner from "../_components/WelcomeBanner";
import { Button } from "@/components/ui/button";
import SemesterDialogBox from "../_components/SemesterDialogBox";
import { BookAIcon, Sparkle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import CourseCard from "../_components/CourseCard";

function SemesterCourse() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  const [courses, setCourses] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    user && GetCourseList();
  }, [user,refreshTrigger]);

  const GetCourseList = async () => {
    setLoading(true);
    const response = await fetch("/api/courses");
    const result = await response.json();
    if (result.success) {
      setCourses(result.data);
      setLoading(false);
    }
  };

  if(loading){
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"
          role="status"
          aria-label="Loading"
        />
        <span className="text-sm text-gray-700">Loading Courses...</span>
      </div>
    </div>
  );
}

  return (
    <div className="p-4">
      <WelcomeBanner />

      {/* Add Course Button */}
      <div className="flex justify-start mt-4">
        <SemesterDialogBox triggerRefresh={triggerRefresh}>
          <Button>
            <Sparkle /> Generate Semester Course
          </Button>
        </SemesterDialogBox>
      </div>

      {/* Courses List */}
      <div className="mt-6">
        {courses.length === 0 ? (
          <p>No courses</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {courses
              .filter((course) => course.isSemesterCourse)
              .map((course, index) => (
                <CourseCard course={course} key={index} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SemesterCourse;
