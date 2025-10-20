import { useState } from "react";
import {
  Home,
  User,
  FolderOpen,
  Shield,
  FileText,
  Settings,
  BarChart3,
  HelpCircle,
  Bell,
  ChevronLeft,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  { title: "Overview", url: "/", icon: Home },
  { title: "Personal", url: "/personal", icon: User },
];

const projectItems = [
  { title: "Admin Panel", url: "/admin", icon: Shield },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Variables", url: "/variables", icon: Settings },
  { title: "Insights", url: "/insights", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium flex items-center gap-2"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-2";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"> */}
            {/*   <span className="text-primary-foreground font-bold text-sm">n8n</span> */}
            {/* </div> */}
            {!isCollapsed && (
              <span className="text-sidebar-foreground font-semibold">
                Settings
              </span>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="flex-1 truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          {/* <div className="px-3 py-2"> */}
          {/*   {!isCollapsed && ( */}
          {/*     <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider"> */}
          {/*       Projects */}
          {/*     </h3> */}
          {/*   )} */}
          {/*   <button className="w-full mt-2 px-3 py-2 text-left text-sm bg-sidebar-accent rounded-md hover:bg-sidebar-accent/80 transition-colors"> */}
          {/*     {!isCollapsed ? ( */}
          {/*       <span className="text-sidebar-accent-foreground"> */}
          {/*         + Add project */}
          {/*       </span> */}
          {/*     ) : ( */}
          {/*       <span className="text-sidebar-accent-foreground text-lg"> */}
          {/*         + */}
          {/*       </span> */}
          {/*     )} */}
          {/*   </button> */}
          {/* </div> */}
          <SidebarGroupContent>
            <div className="p-4 border-t border-sidebar-border"></div>
            <SidebarMenu>
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="flex-1 truncate">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile at Bottom */}
        <div className="mt-auto p-4 border-t border-sidebar-border"></div>
        {/*   <div className="flex items-center gap-3"> */}
        {/*     <Avatar className="w-8 h-8"> */}
        {/*       <AvatarImage src="/placeholder.svg" /> */}
        {/*       <AvatarFallback className="bg-primary text-primary-foreground"> */}
        {/*         K */}
        {/*       </AvatarFallback> */}
        {/*     </Avatar> */}
        {/*     {!isCollapsed && ( */}
        {/*       <div className="flex-1 min-w-0"> */}
        {/*         <p className="text-sm font-medium text-sidebar-foreground truncate"> */}
        {/*           Krishna */}
        {/*         </p> */}
        {/*         <p className="text-xs text-sidebar-foreground/70 truncate"> */}
        {/*           krishna@example.com */}
        {/*         </p> */}
        {/*       </div> */}
        {/*     )} */}
        {/*   </div> */}
        {/* </div> */}
      </SidebarContent>
    </Sidebar>
  );
}

