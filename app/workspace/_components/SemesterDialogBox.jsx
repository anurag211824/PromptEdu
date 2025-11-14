'use client'
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import SemesterCourseForm from "./SemesterCourseForm";

function SemesterDialogBox({ children,triggerRefresh }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Course Using AI</DialogTitle>
        </DialogHeader>

        <SemesterCourseForm triggerRefresh={triggerRefresh}/>
      </DialogContent>
    </Dialog>
  );
}

export default SemesterDialogBox;
