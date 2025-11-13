"use client";
import React, { useEffect, useState } from "react";
import ThemeProvider from "@/contexts/ThemeContext";
import AppHeader from "@/app/workspace/_components/AppHeader";
import ChapterListSidebar from "../_components/ChapterListSidebar";
import ChapterContent from "../_components/ChapterContent";
import { useParams, useRouter } from "next/navigation";
import SelectedChapterIndexProvider from "@/contexts/SelectedChapterIndex";
import { Button } from "@/components/ui/button";
import { Book, Menu, X } from "lucide-react";

function Course() {
  const { courseId } = useParams();
  const [loading,setLoading] = useState(false)
  const router = useRouter();
  const [courseInfo, setCourseInfo] = useState();
  const [isOpen, setIsOpen] = useState(false);

  const GetEnrolledCourseById = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/enroll-course?courseId=" + courseId);
      const response_data = await response.json();
      setCourseInfo(response_data.data);
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  };

  useEffect(() => {
    GetEnrolledCourseById();
  }, []);

  if(loading){
    return <p className="flex items-center justify-center">Loading the course content....</p>
  }

  return (
    <SelectedChapterIndexProvider>
      <ThemeProvider>
        {/* Header */}
        <div className="flex justify-between items-center shadow-lg dark:shadow-gray-800 dark:shadow-sm">
          <Button
            className="ml-2"
            onClick={() => router.push("/workspace/view-course/" + courseId)}
          >
            Back
          <Book />
          </Button>

          {/* Mobile Sidebar Toggle Button */}
          <Button
            className="md:hidden mr-3"
            variant="outline"
            onClick={() => setIsOpen(true)}
          >
            <Menu />
          </Button>

          <AppHeader hideSidebar={true} />
        </div>

        {/* Page Layout */}
        <div className="flex max-w-[1300px] mx-auto w-full">
          {/* Sidebar */}
          <div
            className={`p-3 fixed top-[60px] left-0 h-[calc(100vh-60px)] w-80 border-r overflow-y-auto hide-scrollbar bg-white dark:bg-gray-950 transform transition-transform duration-300 z-50
            ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:block`}
          >
            {/* Close button visible only on mobile */}
            <div className="flex justify-end md:hidden mb-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X />
              </Button>
            </div>

            <ChapterListSidebar courseInfo={courseInfo} />
          </div>

          {/* Scrollable Content */}
          <div className="ml-0 md:ml-80 w-full flex-1 overflow-y-auto h-[calc(100vh-60px)] hide-scrollbar">
            <ChapterContent courseInfo={courseInfo} refreshData={()=>GetEnrolledCourseById()} />
          </div>
        </div>
      </ThemeProvider>
    </SelectedChapterIndexProvider>
  );
}

export default Course;
