import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import ThemeProvider from "@/contexts/ThemeContext";
import WelcomeBanner from "./_components/WelcomeBanner";

function WorkSpacelayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <ThemeProvider>
          <AppHeader />
        </ThemeProvider>
        {children}
      </div>
    </SidebarProvider>
  );
}

export default WorkSpacelayout;
