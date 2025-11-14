'use client'

import React, { useState, useEffect, useContext } from 'react'
import EnrolledCourseCard from '../_components/EnrolledCourseCard'
import CourseCard from '../_components/CourseCard'

const ExploreCourses = () => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/get-all-courses')
        const result = await response.json()
        setCourses(result.data)
        setFilteredCourses(result.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])
  console.log(courses);
  
  useEffect(() => {
    const filtered = courses.filter(course =>
      course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredCourses(filtered)
  }, [searchQuery, courses])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Explore Courses</h1>
        
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {loading ? (
          <div className="text-center py-8">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No courses found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default ExploreCourses
