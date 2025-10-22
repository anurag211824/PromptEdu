// import React, { useState } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import {
//   Book,
//   BuildingIcon,
//   LoaderCircle,
//   Play,
//   PlayCircle,
// } from "lucide-react";
// import Link from "next/link";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// function CourseCard({ course }) {
//   const courseJson = course?.courseJson;
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const onEnrollCourse = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/enroll-course", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           courseId: course?.id,
//         }),
//       });

//       const response_data = await response.json();
//       if (response_data?.success === true) {
//         setLoading(false);
//         toast.success("Enrolled");
//         console.log(response_data.data);
//         window.location.reload();
//       } else {
//         // Ensure we pass a string to the toaster (avoid passing objects)
//         const msg =
//           typeof response_data?.data === "string"
//             ? response_data.data
//             : response_data?.data?.message ||
//               JSON.stringify(response_data?.data || "Unknown error");
//         toast.error(msg);
//         console.log("Enroll failed:", response_data);
//         setLoading(false);
//       }
//     } catch (error) {
//       toast.error("error");
//       setLoading(false);
//       console.log(error);
//     }
//   };
//   return (
//     <div className="flex flex-col  w-full gap-5 shadow-md  shadow-blue-400 rounded-xl p-2">
//       <Image
//         src={course?.bannerImageUrl}
//         alt={courseJson.course.course_name}
//         width={400}
//         height={400}
//         className="w-full aspect-video object-cover rounded-b-none rounded-xl"
//       />
//       <h2 className="font-bold line-clamp-1">
//         {courseJson.course.course_name}
//       </h2>
//       <p className="line-clamp-3 text-[13px]">
//         {courseJson.course.course_description}
//       </p>
//       <div className="flex flex-row items-center gap-3">
//         <span>Chapters:</span> <span>{course.chapters_number}</span>
//         {Object.keys(course?.courseContent).length > 0 ? (
//           <Button disabled={loading} onClick={onEnrollCourse}>
//             {loading === true ? (
//               <LoaderCircle className="animate-spin" />
//             ) : (
//               <PlayCircle />
//             )}
//             Enroll course
//           </Button>
//         ) : (
//           <Link href={`/workspace/edit-course/` + course?.cid}>
//             <Button variant="outline">
//               {" "}
//               <BuildingIcon />
//               Get Content
//             </Button>
//           </Link>
//         )}
//       </div>
//     </div>
//   );
// }

// export default CourseCard;





import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Book,
  BuildingIcon,
  LoaderCircle,
  Play,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function CourseCard({ course, onCourseEnrolled }) {
  const courseJson = course?.courseJson;
  const [loading, setLoading] = useState(false);

  const onEnrollCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/enroll-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course?.id,
        }),
      });

      const response_data = await response.json();
      if (response_data?.success === true) {
        setLoading(false);
        toast.success("Enrolled");
        console.log(response_data.data);
        
        // Trigger refresh via callback
        if (onCourseEnrolled) {
          onCourseEnrolled();
        }
      } else {
        // Ensure we pass a string to the toaster (avoid passing objects)
        const msg =
          typeof response_data?.data === "string"
            ? response_data.data
            : response_data?.data?.message ||
              JSON.stringify(response_data?.data || "Unknown error");
        toast.error(msg);
        console.log("Enroll failed:", response_data);
        setLoading(false);
      }
    } catch (error) {
      toast.error("error");
      setLoading(false);
      console.log(error);
    }
  };
  
  return (
    <div className="flex flex-col  w-full gap-5 shadow-md  shadow-blue-400 rounded-xl p-2">
      <Image
        src={course?.bannerImageUrl}
        alt={courseJson.course.course_name}
        width={400}
        height={400}
        className="w-full aspect-video object-cover rounded-b-none rounded-xl"
      />
      <h2 className="font-bold line-clamp-1">
        {courseJson.course.course_name}
      </h2>
      <p className="line-clamp-3 text-[13px]">
        {courseJson.course.course_description}
      </p>
      <div className="flex flex-row items-center gap-3">
        <span>Chapters:</span> <span>{course.chapters_number}</span>
        {Object.keys(course?.courseContent).length > 0 ? (
          <Button disabled={loading} onClick={onEnrollCourse}>
            {loading === true ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <PlayCircle />
            )}
            Enroll course
          </Button>
        ) : (
          <Link href={`/workspace/edit-course/` + course?.cid}>
            <Button variant="outline">
              {" "}
              <BuildingIcon />
              Get Content
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default CourseCard;