"use client";

import { usePathname } from "next/navigation";
import { Cloud, Clock, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useSidebar } from "./SidebarContext";

export default function Topbar() {
  const pathname = usePathname();
  const [time, setTime] = useState("--:--");
  const { toggle } = useSidebar();

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<string, string> = {
    "/": "Dashboard Overview",
    "/courses": "Course Library",
    "/upload": "Upload Material",
    "/announcements": "Announcements",
    "/manage": "Manage Courses",
  };

  const title = titles[pathname] || "Portal";

  return (
    <header className="h-[70px] border-b border-border bg-bg-main flex items-center justify-between px-4 lg:px-8 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggle}
          className="p-2 -ml-2 text-text-muted hover:text-text-main lg:hidden rounded-md hover:bg-bg-card-hover"
        >
          <Menu size={24} />
        </button>
        <h1 className="font-space font-bold text-[1.1rem] sm:text-[1.35rem] tracking-tight text-text-main m-0 truncate max-w-[150px] sm:max-w-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-[6px] bg-bg-card rounded-full border border-border text-[0.8rem] font-semibold text-success">
          <Cloud size={14} /> <span>Connected</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[0.85rem] font-medium text-text-muted">
          <Clock size={14} /> <span>{time}</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
