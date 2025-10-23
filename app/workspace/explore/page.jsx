'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser } from '@clerk/nextjs';
import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'

function ExploreCourses() {
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
  return (
    <div className='m-5'>
        <h2 className='font-bold text-3xl mb-2'>Explore courses</h2>
        <div className='flex gap-5 max-w-md'>
            <Input placeholder = "search"/>
            <Button><Search/>Search</Button>
        </div>
    </div>
  )
}

export default ExploreCourses