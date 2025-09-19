"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import AddNewCourseDialog from "./AddNewCourseDialog";

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  return (
    <div>
      <h2 className="font-bold text-2xl mt-5">Course List</h2>
      {courseList?.length === 0 ? (
        <div className="mt-2 shadow-md border rounded-xl flex flex-col p-3 justify-center items-center bg-secondary">
          <Image
            src="/online-edu.png"
            alt="logo-online-edu"
            width={400}
            height={300}
          ></Image>
          <h2 className="my-2 text-lg font-semibold text-center">
            Looks like you have not created any courses
          </h2>
          <AddNewCourseDialog>
            <Button className="text-white"> + Create Course</Button>
          </AddNewCourseDialog>
        </div>
      ) : (
        <div>List of courses</div>
      )}
    </div>
  );
}

export default CourseList;
