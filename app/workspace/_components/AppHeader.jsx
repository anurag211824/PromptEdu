"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React, { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import ThemeProvider, { ThemeContext } from "@/contexts/ThemeContext";
import Image from "next/image";

function AppHeader({hideSidebar = false}) {
  const { themeMode,toggleTheme } = useContext(ThemeContext);
  return (

      <div className="flex justify-between items-center p-2 shadow-lg dark:shadow-gray-800 dark:shadow-sm">
       {!hideSidebar && <SidebarTrigger />}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {themeMode === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <UserButton className="w-10 h-10" />
        </div>
      </div>
  
  );
}

export default AppHeader;
