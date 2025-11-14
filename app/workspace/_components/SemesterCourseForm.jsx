'use client'
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2Icon, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

function SemesterCourseForm({triggerRefresh}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    courseId: uuidv4(),
    course_name: "",
    chapters_number: "",
    syllabus: "",
    custom_prompt: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/semester-course-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        triggerRefresh()
        console.log(data.courseId);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl w-full mx-auto p-4 border rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-5">Create Course Using AI</h2>

      <form className="space-y-5" onSubmit={handleSubmit}>

        {/* Course Name */}
        <div className="flex flex-col">
          <Label className="mb-1">Course Name</Label>
          <Input
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
            placeholder="Enter course name"
            required
          />
        </div>

        {/* Number of Chapters */}
        <div className="flex flex-col">
          <Label className="mb-1">No. of Chapters</Label>
          <Input
            type="number"
            name="chapters_number"
            value={formData.chapters_number}
            onChange={handleChange}
            placeholder="e.g., 6"
            required
          />
        </div>

        {/* Syllabus */}
        <div className="flex flex-col">
          <Label className="mb-1">Paste Complete Syllabus</Label>
          <Textarea
            name="syllabus"
            value={formData.syllabus}
            onChange={handleChange}
            rows={6}
            placeholder="Paste the syllabus here..."
            required
          />
        </div>

        {/* Custom Prompt */}
        <div className="flex flex-col">
          <Label className="mb-1">Custom Instructions (Optional)</Label>
          <Textarea
            name="custom_prompt"
            value={formData.custom_prompt}
            onChange={handleChange}
            rows={3}
            placeholder="Add extra instructions for AI..."
          />
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <Sparkle className="mr-2" />
          )}
          Generate Course
        </Button>
      </form>

    </div>
  );
}

export default SemesterCourseForm;
