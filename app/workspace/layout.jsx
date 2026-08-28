import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { AppSidebar } from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import ThemeProvider from "@/contexts/ThemeContext";

function WorkSpaceLayout({ children }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        {/* min-w-0 stops wide content (tables, code blocks) from pushing the layout. */}
        <div className="flex min-h-screen w-full min-w-0 flex-col">
          <AppHeader />
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default WorkSpaceLayout;
