import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BuildingIcon, LoaderCircle, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function EnrolledCourseCard({course, enrollcourse}) {
    console.log(course);
    console.log(enrollcourse);
    
    const calculateCourseProgress = ()=>{
      return (enrollcourse?.completedChapters?.length??0 / course?.courseContent.length)*100
    }
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