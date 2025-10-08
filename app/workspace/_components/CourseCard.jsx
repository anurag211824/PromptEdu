import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BuildingIcon, Play, PlayCircle } from "lucide-react";
import Link from "next/link";

function CourseCard({ course }) {
  const courseJson = course?.courseJson;
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
      <div className="flex flex-row  gap-2">
        <Button>
          {" "}
          {course.difficulty.charAt(0).toUpperCase() +
            course.difficulty.slice(1)}
        </Button>
        {Object.keys(course?.courseContent).length > 0 ? (
          <Button>
            <PlayCircle />
            Start Learning
          </Button>
        ) : (
          <Link href={`/workspace/edit-course/`+ course?.cid}>
          <Button variant="outline">
            {" "}
            <BuildingIcon />
            Gen Content
          </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default CourseCard;
