"use client";
import { selectProfile } from "@/stores/selectors";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Compass,
  ChartNoAxesColumnIncreasing,
  Check,
  Info,
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
import { isHrEmployee } from "@/lib/employees";
import { useSettingsI18n } from "@/components/settings/i18n";

const EMPLOYEE_NAVIGATION = [
  { href: "/", label: "Моё развитие", icon: LayoutDashboard },
  { href: "/trajectory", label: "Карта навыков", icon: ChartNoAxesColumnIncreasing },
  { href: "/activities", label: "Мои активности", icon: Activity },
];

// Локализация для кнопки "О нас"
const ABOUT_TRANSLATIONS = {
  ru: "О нас",
  en: "About us",
};

export function AppSidebar() {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const pathname = usePathname();
  const profile = useUserStore(selectProfile);
  const { t, language } = useSettingsI18n(); // Определение текущего языка из вашего I18n
  const isHr = isHrEmployee(profile);
  const { isMobile, setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme();
  const [mounted, setMounted] = React.useState(false);

  // Получаем перевод для текущего языка (по умолчанию RU)
  const aboutLabel = ABOUT_TRANSLATIONS[(language as "ru" | "en") || "ru"] || ABOUT_TRANSLATIONS.ru;

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
        <SidebarHeader className="border-b border-sidebar-border/60 p-3">
          <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
            <SidebarMenu className="flex-1 group-data-[collapsible=icon]:hidden">
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="hover:bg-transparent cursor-default">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Compass className="size-5" /></span>
                  <span className="flex flex-col gap-0.5"><span className="text-sm font-semibold tracking-tight">Intentive</span><span className="text-[10px] tracking-wide text-muted-foreground">CAREER QUEST</span></span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3 space-y-4">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/70 px-2 mb-1.5">
              Ваше пространство
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {EMPLOYEE_NAVIGATION.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} />}
                        isActive={isActive}
                        tooltip={item.label}
                        className="transition-all duration-150 rounded-md px-2.5 py-2"
                      >
                        <Icon className="size-4 shrink-0 transition-transform duration-150 group-hover/menu-button:scale-105" />
                        <span className="font-medium text-sm">{item.href === "/" ? t.navDevelopment : item.href === "/trajectory" ? t.navSkills : t.navActivities}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isHr && (
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/70 px-2 mb-1.5">
                Для HR
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/hr" onClick={() => isMobile && setOpenMobile(false)} />}
                      isActive={pathname === "/hr"}
                      tooltip="Обзор команды"
                      className="transition-all duration-150 rounded-md px-2.5 py-2"
                    >
                      <UsersRound className="size-4 shrink-0 transition-transform duration-150 group-hover/menu-button:scale-105" />
                      <span className="font-medium text-sm">{t.navHr}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarSeparator className="mx-2 opacity-50" />

        <SidebarFooter className="p-2">
          <SidebarMenu className="gap-1.5">
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton tooltip="Toggle Theme" className="transition-all duration-150 rounded-md px-2.5 py-2">
                      {getThemeIcon()}
                      <span className="font-medium text-sm">{t.theme}</span>
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent side="right" align="end" className="w-48 shadow-md">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                      {t.colorTheme}
                    </DropdownMenuLabel>
                    {colorThemes.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => setColorTheme(item.id)}
                        className="flex items-center justify-between cursor-pointer py-1.5"
                      >
                        <span>{item.name}</span>
                        {colorTheme === item.id && <Check className="size-3.5 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                      {t.mode}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setTheme("light")}
                      className="flex items-center justify-between cursor-pointer py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="size-4" />
                        <span>{t.light}</span>
                      </div>
                      {theme === "light" && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("dark")}
                      className="flex items-center justify-between cursor-pointer py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="size-4" />
                        <span>{t.dark}</span>
                      </div>
                      {theme === "dark" && <Check className="size-3.5 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("system")}
                      className="flex items-center justify-between cursor-pointer py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Laptop className="size-4" />
                        <span>{t.system}</span>
                      </div>
                      {theme === "system" && <Check className="size-3.5 text-primary" />}
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
                tooltip={t.settings}
                className="transition-all duration-150 rounded-md px-2.5 py-2"
              >
                <Settings className="size-4" />
                <span className="font-medium text-sm">{t.settings}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Кнопка "О нас" */}
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/about" onClick={() => isMobile && setOpenMobile(false)} />}
                isActive={pathname === "/about"}
                tooltip={aboutLabel}
                className="transition-all duration-150 rounded-md px-2.5 py-2"
              >
                <Info className="size-4 shrink-0 transition-transform duration-150 group-hover/menu-button:scale-105" />
                <span className="font-medium text-sm">{aboutLabel}</span>
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