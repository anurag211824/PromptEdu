'use client'
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
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
import { Loader2Icon, Sparkle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const emptyForm = () => ({
  courseId: uuidv4(),
  course_name: "",
  course_description: "",
  chapters_number: "",
  include_videos: false,
  difficulty: "",
  category: "",
});

function AddNewCourseDialog({ children }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading,setLoading] = useState(false)
  const [formData, setFormData] = useState(emptyForm);
  const [suggestions, setSuggestions] = useState([]);
  const [suggesting, setSuggesting] = useState(false);

  // Read inside the debounced effect without making it re-run on every change
  // to difficulty or category.
  const formRef = useRef(formData);
  formRef.current = formData;

  // Suggest descriptions once the learner has typed a course name and paused.
  useEffect(() => {
    const name = formData.course_name.trim();

    if (!open || name.length < 3) {
      setSuggestions([]);
      setSuggesting(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSuggesting(true);
        const response = await fetch("/api/suggest-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseName: name,
            difficulty: formRef.current.difficulty,
            category: formRef.current.category,
          }),
          signal: controller.signal,
        });
        const data = await response.json();
        setSuggestions(data.suggestions ?? []);
      } catch (error) {
        // Aborted by the next keystroke, or the request failed. Either way
        // suggestions are optional, so fail quietly.
        if (error.name !== "AbortError") {
          console.error("Description suggestions failed:", error);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setSuggesting(false);
      }
    }, 700);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.course_name, open]);

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
        // Close the dialog and clear it before navigating, so it isn't still
        // sitting open over the course page it just created.
        setOpen(false)
        setFormData(emptyForm())
        setSuggestions([])
        toast.success("Course created")
        router.push("/workspace/edit-course/" + data.courseId)
      } else {
        // Keep the dialog open and the input intact so it can be retried.
        console.error("API error:", data);
        toast.error(data.error ?? "Could not create the course. Please try again.")
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  };
  return (
    <Dialog
      open={open}
      // Ignore dismissals while a course is generating, so the request isn't
      // abandoned halfway through.
      onOpenChange={(next) => {
        if (!loading) setOpen(next);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* Wide enough to put the description and its suggestions side by side,
          which keeps the form short instead of a long scrolling column. */}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Course Using AI</DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Course Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              type="text"
              id="course_name"
              name="course_name"
              value={formData.course_name}
              onChange={handleChange}
              placeholder="e.g. Java Programming Language"
            />
          </div>

          {/* Description, with its suggestions alongside on wider screens.
              Both columns stretch to the same height, so the textarea grows to
              match the suggestion list rather than sitting short beside it. */}
          <div className="grid items-stretch gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="course_description">Course Description</Label>
              <Textarea
                id="course_description"
                name="course_description"
                value={formData.course_description}
                onChange={handleChange}
                placeholder="Describe the course, or pick a suggestion"
                className="min-h-40 flex-1 resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="flex h-5 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {suggesting
                  ? "Writing suggestions…"
                  : suggestions.length > 0
                    ? "Click one to use it"
                    : "Suggestions"}
              </p>

              {suggesting ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-[84px] w-full animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            course_description: suggestion,
                          }))
                        }
                        title={suggestion}
                        className={`w-full rounded-md border p-2.5 text-left text-[13px] leading-relaxed transition-colors hover:bg-accent ${
                          formData.course_description === suggestion
                            ? "border-primary bg-accent text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {/* Clamped so an unusually long suggestion can't keep
                            stretching the dialog downwards. */}
                        <span className="line-clamp-3">{suggestion}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex min-h-40 flex-1 items-center justify-center rounded-md border border-dashed p-4 text-center text-[13px] text-muted-foreground">
                  Enter a course name to see suggested descriptions.
                </div>
              )}
            </div>
          </div>

          {/* Chapters / difficulty / category share one row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="chapters_number">No. of Chapters</Label>
              <Input
                type="number"
                id="chapters_number"
                name="chapters_number"
                value={formData.chapters_number}
                onChange={handleChange}
                placeholder="e.g. 5"
              />
            </div>

            <div className="flex flex-col gap-2">
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Comma separated"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="include_videos"
                checked={formData.include_videos}
                onCheckedChange={handleSwitch}
              />
              <Label htmlFor="include_videos">Include Videos</Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-48"
            >
              {loading ? (
                <Loader2Icon className="animate-spin" aria-hidden />
              ) : (
                <Sparkle aria-hidden />
              )}
              Generate Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewCourseDialog;
