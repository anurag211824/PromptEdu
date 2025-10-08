'use client'
import { Button } from "@/components/ui/button";
import { Book, Clock, Loader2Icon, Settings, Sparkle, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

function CourseInfo({ course }) {
  const courseLayout = course?.courseJson.course;
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const GenerateCourseContent = async () => {
    // call api to genearate content
    try {
        setLoading(true)
      const response = await fetch("/api/generate-course-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseLayout: courseLayout,
          courseTitle: course?.course_name,
          courseId: course?.cid,
        }),

       
        
      });

      const response_data = await response.json();
      if (response_data.success) {
        setLoading(false)
        router.replace("/workspace")
        toast.success("Course Generated successfully")
        console.log(response_data.courseContent);
      }
      else{
        setLoading(false)
      }


       
    } catch (error) {
        setLoading(false)
        toast.error("server side error:",error)
      console.log(error);
    }
  };
  return (
    <div className="flex flex-col md:flex-row gap-5 justify-between shadow-md p-4 shadow-blue-400 rounded-md">
      <div className=" w-full flex flex-col gap-3 md:w-[70%]">
        <h2 className="font-bold text-3xl">{courseLayout?.course_name}</h2>
        <p className="line-clamp-2 text-gray-500">
          {courseLayout?.course_description}
        </p>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <div className="flex gap-5 items-center p-3 rounded-lg shadow-sm shadow-blue-400">
              <Clock className="text-blue-500" />
              <section>
                <h2 className="font-bold">Duration</h2>
                <h2>2 Hour</h2>
              </section>
            </div>

            <div className="flex gap-5 items-center p-3 rounded-lg shadow-sm shadow-blue-400">
              <Book className="text-green-500" />
              <section>
                <h2 className="font-bold">Chapters</h2>
                <h2>2 Hour</h2>
              </section>
            </div>

            <div className="flex gap-5 items-center p-3 rounded-lg shadow-sm shadow-blue-400">
              <TrendingUp className="text-red-500" />
              <section>
                <h2 className="font-bold">Difficulty Level</h2>
                <h2>{course?.difficulty}</h2>
              </section>
            </div>
          </div>
          <Button onClick={GenerateCourseContent} className="w-full text-white  text-[17px]">
             {
                    loading ? <Loader2Icon  className="animate-spin"/> :   <Settings />
                  }
            Generate Content
          </Button>
        </div>
      </div>

      {course?.bannerImageUrl ? (
        <Image
          src={course.bannerImageUrl}
          alt="bannerImage"
          width={200}
          height={200}
          className="object-cover w-full md:w-[30%] h-[280px] rounded-md"
        />
      ) : (
        <div className="w-full md:w-[30%] h-[280px] bg-gray-200 animate-pulse rounded-md" />
      )}
    </div>
  );
}

export default CourseInfo;
