"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Flag,
  ShieldAlert,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Bar Huddle",
    email: "admin@example.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "User Management",
      items: [
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Users,
        },
      ],
    },
    {
      label: "Moderation",
      items: [
        {
          title: "Reports",
          url: "/dashboard/moderation/reports",
          icon: Flag,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useSelector((state: RootState) => state.auth.user);

  const userData = user
    ? {
      name: user.name,
      email: user.email,
      avatar: "",
    }
    : {
      name: "Guest",
      email: "",
      avatar: "",
    };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-16 items-center justify-center rounded-lg text-primary-foreground">
                  <Logo size={120} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Bar Huddle</span>
                  <span className="text-muted-foreground group-hover/menu-item:text-sidebar-accent-foreground/80 truncate text-xs">
                    Admin Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
