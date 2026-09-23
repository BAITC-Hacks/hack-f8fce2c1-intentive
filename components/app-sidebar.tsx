"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChartNoAxesColumnIncreasing,
  Check,
  Laptop,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  UsersRound,
} from "lucide-react";
import { useTheme } from "next-themes";
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
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsDialog } from "@/components/settings";
import { useColorTheme } from "@/components/themes/theme-provider";
import { useUserStore } from "@/components/providers/user-store-provider";

const EMPLOYEE_NAVIGATION = [
  { href: "/", label: "My development", icon: LayoutDashboard },
  { href: "/trajectory", label: "Skills & trajectory", icon: ChartNoAxesColumnIncreasing },
  { href: "/activities", label: "Activities", icon: Activity },
];

export function AppSidebar() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const pathname = usePathname();
  const accountType = useUserStore((state) => state.accountType);
  const { isMobile, setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="size-4" />;
    if (theme === "dark") return <Moon className="size-4" />;
    if (theme === "light") return <Sun className="size-4" />;
    return <Laptop className="size-4" />;
  };

  return (
    <>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
            <SidebarMenu className="flex-1 group-data-[collapsible=icon]:hidden">
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarTrigger className="shrink-0" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {accountType === "employee" ? (
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {EMPLOYEE_NAVIGATION.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} />}
                          isActive={pathname === item.href}
                          tooltip={item.label}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>HR workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/hr" onClick={() => isMobile && setOpenMobile(false)} />}
                      isActive={pathname === "/hr"}
                      tooltip="HR overview"
                    >
                      <UsersRound />
                      <span>HR overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-2 gap-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton tooltip="Toggle Theme">
                      {getThemeIcon()}
                      <span>Theme</span>
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent side="right" align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                      Color Theme
                    </DropdownMenuLabel>
                    {colorThemes.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => setColorTheme(item.id)}
                        className="flex items-center justify-between"
                      >
                        <span>{item.name}</span>
                        {colorTheme === item.id && <Check className="size-3.5" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                      Mode
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setTheme("light")}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="size-4" />
                        <span>Light</span>
                      </div>
                      {theme === "light" && <Check className="size-3.5" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("dark")}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="size-4" />
                        <span>Dark</span>
                      </div>
                      {theme === "dark" && <Check className="size-3.5" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("system")}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Laptop className="size-4" />
                        <span>System</span>
                      </div>
                      {theme === "system" && <Check className="size-3.5" />}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  setSettingsOpen(true);
                  if (isMobile) setOpenMobile(false);
                }}
                tooltip="Settings"
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  );
}
