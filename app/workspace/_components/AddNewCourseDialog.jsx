'use client'
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,  
  SelectValue,
} from "@/components/ui/select";
import { Loader2Icon, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";

function AddNewCourseDialog({ children }) {
  const router = useRouter()
  const [loading,setLoading] = useState(false)
  const [formData, setFormData] = useState({
    courseId: uuidv4(),
    course_name: "",
    course_description: "",
    chapters_number: "",
    include_videos: false,
    difficulty: "",
    category: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitch = (checked) => {
    setFormData((prev) => ({
      ...prev,
      include_videos: checked,
    }));
  };

  const handleSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      difficulty: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data being sent:", formData);
    try {
      setLoading(true)
      const response = await fetch("/api/generate-course-layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
      setLoading(false)
      console.log(data.courseId);
      
      router.push("/workspace/edit-course/"+data.courseId)
       
      
      } else {
        console.error("API error:", data);
        setLoading(false)
      }
    } catch (err) {
      console.error("Network error:", err);
    }

    setFormData({
      courseId: uuidv4(),
      course_name: "",
      course_description: "",
      chapters_number: "",
      include_videos: false,
      difficulty: "",
      category: "",
    });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Course Using AI</DialogTitle>
          <DialogDescription asChild>
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              {/* Course Name */}
              <div className="w-full flex flex-col gap-3 mt-2">
                <Label htmlFor="course_name">Course Name</Label>
                <Input
                  type="text"
                  id="course_name"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleChange}
                  placeholder="Enter Course"
                />
              </div>

              {/* Course Description */}
              <div className="w-full flex flex-col gap-3 mt-2">
                <Label htmlFor="course_description">Course Description</Label>
                <Textarea
                  id="course_description"
                  name="course_description"
                  value={formData.course_description}
                  onChange={handleChange}
                />
              </div>

              {/* Chapters Number */}
              <div className="w-full flex flex-col gap-3 mt-2">
                <Label htmlFor="chapters_number">No. of Chapters</Label>
                <Input
                  type="number"
                  id="chapters_number"
                  name="chapters_number"
                  value={formData.chapters_number}
                  onChange={handleChange}
                  placeholder="Enter no. of chapters"
                />
              </div>

              {/* Include Videos */}
              <div className="w-full flex gap-2 items-center mt-2 mb-2">
                <Label htmlFor="include_videos">Include Videos</Label>
                <Switch
                  id="include_videos"
                  checked={formData.include_videos}
                  onCheckedChange={handleSwitch}
                />
              </div>

              {/* Difficulty */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <Label htmlFor="difficulty-label">Difficulty Level</Label>
                <Select
                  id="difficulty-label"
                  value={formData.difficulty}
                  onValueChange={handleSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="w-full flex flex-col gap-3 mt-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Category (Separated by Comma)"
                />
              </div>

              <div className="mt-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {
                    loading ? <Loader2Icon  className="animate-spin"/> :  <Sparkle className="mr-2" /> 
                  }
                 Generate Course
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourseDialog;
