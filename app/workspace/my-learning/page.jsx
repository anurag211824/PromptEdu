import React from "react";
import { EnrollCourseList } from "../_components/EnrollCourseList";

function MyLearning() {
  return (
    <div className="mx-auto max-w-7xl p-5 md:p-7">
      <h1 className="text-2xl font-bold">My learning</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every course you&apos;re enrolled in, and how far you&apos;ve got.
      </p>
      <EnrollCourseList />
    </div>
  );
}

export default MyLearning;
