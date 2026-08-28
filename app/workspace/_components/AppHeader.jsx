"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React, { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "@/contexts/ThemeContext";

function AppHeader({ hideSidebar = false }) {
  const { themeMode, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-3 md:px-4">
      {hideSidebar ? <div /> : <SidebarTrigger />}

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} theme`}
        >
          {themeMode === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <UserButton />
      </div>
    </header>
  );
}

export default AppHeader;
