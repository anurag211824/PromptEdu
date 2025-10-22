// import React from "react";
// import WelcomeBanner from "./_components/WelcomeBanner";
// import CourseList from "./_components/CourseList";
// import { EnrollCourseList } from "./_components/EnrollCourseList";

// function WorkSpace() {
//   return (
//     <div className="p-7">
//       <WelcomeBanner />
    
//         <EnrollCourseList />

//       <CourseList />
//     </div>
//   );
// }

// export default WorkSpace;



"use client";
import React, { useState } from "react";
import WelcomeBanner from "./_components/WelcomeBanner";
import CourseList from "./_components/CourseList";
import { EnrollCourseList } from "./_components/EnrollCourseList";

function WorkSpace() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-7">
      <WelcomeBanner />
      <EnrollCourseList key={refreshTrigger} />
      <CourseList onCourseEnrolled={triggerRefresh} />
    </div>
  );
}

export default WorkSpace;