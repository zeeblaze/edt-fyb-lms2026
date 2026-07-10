"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { SidebarProvider } from "@/components/SidebarContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/login' || pathname === '/signup';

  if (isPublicPage) {
    return <main className="flex-1 w-full h-screen overflow-y-auto">{children}</main>;
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
