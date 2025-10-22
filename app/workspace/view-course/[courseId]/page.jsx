'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import EditCourse from '../../edit-course/[courseId]/page';
function ViewCourse() {
  const {courseId} = useParams()
  console.log(courseId);
  
  return (
    <div>
      <EditCourse viewCourse={true}/> 
    </div>
  )
}

export default ViewCourse