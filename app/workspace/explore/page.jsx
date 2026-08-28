"use client";

import React, { useState, useEffect, useMemo } from "react";
import CourseCard from "../_components/CourseCard";
import CourseGridSkeleton from "../_components/CourseGridSkeleton";
import { Input } from "@/components/ui/input";
import { Compass, Search } from "lucide-react";
import { toast } from "sonner";

const ExploreCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/get-all-courses");
        const result = await response.json();
        setCourses(result.data ?? []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Could not load courses. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter(
      (course) =>
        course.course_name?.toLowerCase().includes(query) ||
        course.course_description?.toLowerCase().includes(query)
    );
  }, [searchQuery, courses]);

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-7">
      <h1 className="text-2xl font-bold">Explore courses</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse courses created by the PromptEdu community.
      </p>

      <div className="relative mt-5 max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search courses…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          aria-label="Search courses"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <CourseGridSkeleton count={6} />
        ) : filteredCourses.length > 0 ? (
          <>
            {searchQuery && (
              <p className="mb-4 text-sm text-muted-foreground">
                {filteredCourses.length} result
                {filteredCourses.length === 1 ? "" : "s"} for “{searchQuery}”
              </p>
            )}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
            <Compass className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
            <h2 className="font-semibold">
              {searchQuery ? "No matching courses" : "No courses yet"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {searchQuery
                ? `Nothing matched “${searchQuery}”. Try a different search.`
                : "Once courses are published they'll show up here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreCourses;
