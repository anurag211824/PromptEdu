// "use client";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import React, { useEffect, useState } from "react";
// import AddNewCourseDialog from "./AddNewCourseDialog";
// import { useUser } from "@clerk/nextjs";
// import CourseCard from "./CourseCard";

// function CourseList() {
//   const [courseList, setCourseList] = useState([]);
//   const {user} = useUser()
//   const [loading,setLoading] = useState(false)
//   useEffect(()=>{
//     user && GetCourseList()
//   },[user])
//   const GetCourseList = async()=>{
//     setLoading(true)
//    const response = await fetch("/api/courses")
//    const result  = await response.json()
//    if(result.success){
//     setCourseList(result.data)
//      setLoading(false)
//     console.log(result.data);
    
//    }

//   }
//   if(loading){
//     return <p>Loading Courses</p>
//   }
//   return (
//     <div>
//       <h2 className="font-bold text-2xl mt-5 mb-3">Course List</h2>
     
//       {courseList?.length === 0 ? (
//         <div className="mt-2 shadow-md border rounded-xl flex flex-col p-3 justify-center items-center bg-secondary">
//           <Image
//             src="/online-edu.png"
//             alt="logo-online-edu"
//             width={400}
//             height={300}
//           ></Image>
//           <h2 className="my-2 text-lg font-semibold text-center">
//             Looks like you have not created any courses
//           </h2>
//           <AddNewCourseDialog>
//             <Button className="text-white"> + Create Course</Button>
//           </AddNewCourseDialog>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-4 gap-5">
//           {
//             courseList?.map((course,index)=>{
//               return <CourseCard course = {course} key = {index}/>
//             })
//           }
//         </div>
//       )}
//     </div>
//   );
// }

// export default CourseList;





"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AddNewCourseDialog from "./AddNewCourseDialog";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";

function CourseList({ onCourseEnrolled }) {
  const [courseList, setCourseList] = useState([]);
  const {user} = useUser()
  const [loading,setLoading] = useState(false)
  useEffect(()=>{
    user && GetCourseList()
  },[user])
  const GetCourseList = async()=>{
    setLoading(true)
   const response = await fetch("/api/courses")
   const result  = await response.json()
   if(result.success){
    setCourseList(result.data)
     setLoading(false)
    console.log(result.data);
   }
}

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
    <div>
      <h2 className="font-bold text-2xl mt-5 mb-3">Course List</h2>
     
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
        <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-4 gap-5">
          {
            courseList?.map((course,index)=>{
              return <CourseCard course={course} key={index} onCourseEnrolled={onCourseEnrolled}/>
            })
          }
        </div>
      )}
    </div>
  );
}

export default CourseList;