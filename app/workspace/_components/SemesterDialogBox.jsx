'use client'
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import SemesterCourseForm from "./SemesterCourseForm";

function SemesterDialogBox({ children, triggerRefresh }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Course Using AI</DialogTitle>
        </DialogHeader>

        <SemesterCourseForm
          triggerRefresh={triggerRefresh}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export default SemesterDialogBox;
