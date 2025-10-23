import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BuildingIcon, LoaderCircle, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function EnrolledCourseCard({course, enrollcourse}) {
    console.log(enrollcourse);
    
    const calculateCourseProgress = () => {
    // safe length values
    const completed = Array.isArray(enrollcourse?.completedChapters)
      ? enrollcourse.completedChapters.length
      : 0;

    const total = Array.isArray(course?.courseContent)
      ? course.courseContent.length
      : 0;

    if (total === 0) return 0;

    const percent = Math.round((completed / total) * 100);
    // clamp to [0,100]
    return Math.min(100, Math.max(0, percent));
  };
  return (
    <div className="flex flex-col  w-full gap-5 shadow-md  shadow-blue-400 rounded-xl p-2">
      <Image
        src={course?.bannerImageUrl}
        alt={course.course_name}
        width={400}
        height={400}
        className="w-full aspect-video object-cover rounded-b-none rounded-xl h-[170px]"
      />
      <h2 className="font-bold line-clamp-1">
        {course.course_name}
      </h2>
      <p className="line-clamp-3 text-[13px]">
        {course.course_description}
      </p>
      <div className="flex flex-col gap-2">
        <h2 className='flex justify-between text-sm text-primary'>
          Progress <span>{calculateCourseProgress()}%</span>
        </h2>
        <Progress value={calculateCourseProgress()}/>
        <Link href={'/workspace/view-course/'+course?.cid}>
         <Button className="w-full mt-2"> <PlayCircle/> Continue Learning</Button>
        </Link>
       
      </div>
    </div>
  )
}

export default EnrolledCourseCard