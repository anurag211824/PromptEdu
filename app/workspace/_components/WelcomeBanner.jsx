"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import AddNewCourseDialog from "./AddNewCourseDialog";

function WelcomeBanner() {
  const { user } = useUser();
  const firstName = user?.firstName;

  return (
    <div className="flex flex-col gap-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white md:flex-row md:items-center md:justify-between dark:from-blue-900 dark:to-indigo-950">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-blue-100">
          Learn, create and explore your favourite courses.
        </p>
      </div>

      <AddNewCourseDialog>
        <Button
          variant="secondary"
          className="shrink-0 text-blue-700 hover:text-blue-800"
        >
          <Sparkles aria-hidden />
          Create a course
        </Button>
      </AddNewCourseDialog>
    </div>
  );
}

export default WelcomeBanner;
