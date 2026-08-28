"use client";
import React, { useState } from "react";
import WelcomeBanner from "./_components/WelcomeBanner";
import CourseList from "./_components/CourseList";
import { EnrollCourseList } from "./_components/EnrollCourseList";

function WorkSpace() {
  // Bumped after an enrollment so the "Continue learning" list refetches.
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-7">
      <WelcomeBanner />
      <EnrollCourseList key={refreshTrigger} />
      <CourseList onCourseEnrolled={() => setRefreshTrigger((n) => n + 1)} />
    </div>
  );
}

export default WorkSpace;
