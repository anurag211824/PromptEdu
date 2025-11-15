"use client";
import React, { useEffect, useState } from "react";
import EnrolledCourseCard from "./EnrolledCourseCard";

function EnrollCourseList() {
  const [enrolledCourseList,setEnrolledCourseList] = useState([])
  const [courseRemoved,setCourseRemoved] = useState(false);
   const GetEnrolledCourse = async () => {
   try{
     const response = await fetch("/api/enroll-course");
    const response_data = await response.json();
    console.log(response_data.data);
    
    setEnrolledCourseList(response_data.data)
   }
   catch(error){
    console.log(error);
    
   }
  
  };
  useEffect(() => {
    GetEnrolledCourse();
  }, [courseRemoved]);
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
