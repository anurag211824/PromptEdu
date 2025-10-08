"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";

function EditCourse() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course,setCourse] = useState()

  useEffect(() => {
    getCourseInfo();
  }, []);
  const getCourseInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses?courseId=" + courseId);
      const response_data = await response.json();
      if (response_data.success) {
        setLoading(false);
        setCourse(response_data.data)
        console.log(response_data.data);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="p-5">
      <CourseInfo course = {course} />
      <ChapterTopicList course={course}/>
    </div>
  );
}

export default EditCourse;
