"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Book,
  Compass,
  LayoutDashboard,
  Sparkles,
  UserCircle2Icon,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddNewCourseDialog from "./AddNewCourseDialog";

const LearnOptions = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/workspace" },
  { title: "My Learning", icon: Book, path: "/workspace/my-learning" },
  { title: "Explore Courses", icon: Compass, path: "/workspace/explore" },
];

const AccountOptions = [
  { title: "Billing", icon: WalletCards, path: "/workspace/billings" },
  { title: "Profile", icon: UserCircle2Icon, path: "/workspace/profile" },
];

export function AppSidebar() {
  const path = usePathname();

  // "/workspace" prefixes every other route, so it only matches exactly.
  const isActive = (optionPath) =>
    optionPath === "/workspace" ? path === optionPath : path.startsWith(optionPath);

  const renderMenu = (options) => (
    <SidebarMenu>
      {options.map((option) => {
        const active = isActive(option.path);
        return (
          <SidebarMenuItem key={option.path}>
            <SidebarMenuButton asChild isActive={active}>
              <Link href={option.path} aria-current={active ? "page" : undefined}>
                <option.icon />
                <span>{option.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <Link href="/" aria-label="PromptEdu home">
          <Image src="/logo.svg" alt="PromptEdu" width={130} height={40} priority />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <AddNewCourseDialog>
            <Button className="w-full">
              <Sparkles aria-hidden />
              Create New Course
            </Button>
          </AddNewCourseDialog>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Learn</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(LearnOptions)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(AccountOptions)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
