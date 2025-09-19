import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import CourseList from './_components/CourseList'

function WorkSpace() {
  return (
    <div className='p-7'>
           <WelcomeBanner/>
           <CourseList/>
    </div>
  )
}

export default WorkSpace