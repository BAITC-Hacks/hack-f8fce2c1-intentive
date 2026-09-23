"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SETTINGS_TABS, DEFAULT_SETTINGS_TAB } from "./settings-config";

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  defaultTab?: string;
}

export function SettingsDialog({
  open,
  onOpenChange,
  trigger,
  defaultTab = DEFAULT_SETTINGS_TAB,
}: SettingsDialogProps) {
  const [activeTabId, setActiveTabId] = React.useState(defaultTab);
  const isMobile = useIsMobile();
  const activeTab =
    SETTINGS_TABS.find((tab) => tab.id === activeTabId) || SETTINGS_TABS[0];
  const ActiveComponent = activeTab.component;

  const settingsContent = (
    <>
      <aside className="flex w-full shrink-0 flex-col justify-between border-b border-border/40 bg-muted/30 p-3 md:w-64 md:border-r md:border-b-0">
        <div className="flex flex-col gap-4">
          <div className="hidden px-3 pt-2 pb-1 md:block">
            <h2 className="text-sm font-semibold tracking-tight text-foreground/90">
              Settings
            </h2>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto md:flex-col md:overflow-y-auto">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={cn(
                    "group relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring md:w-full",
                    isActive
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute top-1.5 bottom-1.5 left-0 hidden w-1 rounded-r-full bg-primary md:block" />
                  )}
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <div
          key={activeTab.id}
          className="flex-1 overflow-y-auto p-5 animate-in fade-in-50 duration-200 md:p-8"
        >
          <div className="mb-6 border-b border-border/40 pb-4">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {activeTab.label}
            </h3>
            {activeTab.description && (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {activeTab.description}
              </p>
            )}
          </div>
          <div className="space-y-6">
            <ActiveComponent />
          </div>
        </div>
      </main>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        {trigger && <DrawerTrigger render={trigger as React.ReactElement} />}
        <DrawerContent className="h-[min(85dvh,44rem)]">
          <DrawerTitle className="sr-only">Settings</DrawerTitle>
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3 z-10"
              />
            }
          >
            <X />
            <span className="sr-only">Close settings</span>
          </DrawerClose>
          <div className="flex min-h-0 flex-1 flex-col">{settingsContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent className="h-[85vh] max-h-[680px] gap-0 overflow-hidden rounded-2xl border-border/50 p-0 shadow-2xl md:flex md:max-w-4xl md:flex-row">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        {settingsContent}
      </DialogContent>
    </Dialog>
  );
}
