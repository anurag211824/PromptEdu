import React from 'react'
import WelcomeBanner from '../_components/WelcomeBanner'
import { EnrollCourseList } from '../_components/EnrollCourseList'

function MyLearning() {
  return (
   <div className='m-5'>
    <WelcomeBanner/>
    <EnrollCourseList/>
   </div>
  )
}

export default MyLearning