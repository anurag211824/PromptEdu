"use client";
import React, { useEffect, useState } from "react";
import EnrolledCourseCard from "./EnrolledCourseCard";

function EnrollCourseList() {
  const [loading,setLoading] = useState(false);
  const [enrolledCourseList,setEnrolledCourseList] = useState([])
  const [courseRemoved,setCourseRemoved] = useState(false);
   const GetEnrolledCourse = async () => {
   try{
    setLoading(true)
     const response = await fetch("/api/enroll-course");
    const response_data = await response.json();
    console.log(response_data.data);
    setLoading(false)
    
    setEnrolledCourseList(response_data.data)
   }
   catch(error){
    setLoading(false)
    alert("error happend")
    console.log(error);
    
   }
  
  };
  useEffect(() => {
    GetEnrolledCourse();
  }, [courseRemoved]);

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


  return enrolledCourseList.length > 0 &&  <div className="mt-3">
        <h2 className="font-bold text-2xl mb-3">
            Continue Learning your courses
        </h2>
       <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-3 gap-5">
         {enrolledCourseList.map((course,index)=>{
            return <EnrolledCourseCard setCourseRemoved={setCourseRemoved} course={course?.courses} key={index} enrollcourse={course?.enrollCourse}/>
        })}
       </div>
  </div>;
}

export {GetEnrolledCourse,EnrollCourseList}
