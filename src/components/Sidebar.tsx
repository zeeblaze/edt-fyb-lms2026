"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, BookOpen, UploadCloud, Megaphone, Settings, X, LogOut } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, setIsOpen } = useSidebar();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutGrid },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Upload Material", href: "/upload", icon: UploadCloud },
    { name: "Announcements", href: "/announcements", icon: Megaphone },
    { name: "Manage Courses", href: "/manage", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-bg-dark border-r border-border flex flex-col shrink-0
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] bg-gradient-to-br from-primary to-primary-hover text-white rounded-lg flex items-center justify-center shadow-md">
                <UploadCloud size={22} />
              </div>
              <div>
                <div className="font-space font-bold text-[1.15rem] leading-tight text-text-main tracking-tight">Upload Portal</div>
                <div className="text-[0.75rem] text-primary uppercase font-bold tracking-wider">LMS Management</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-text-muted hover:text-text-main">
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1">
        <div className="text-[0.7rem] uppercase tracking-wider font-bold text-text-muted mb-2 px-3">Navigate</div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-[10px] rounded-md font-medium text-[0.95rem] transition-all
                ${isActive ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-text-muted hover:bg-bg-card-hover hover:text-text-main'}
              `}
            >
              <Icon size={18} /> {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto flex flex-col gap-3">
        <div className="flex items-center gap-3 px-3 py-2 bg-bg-main rounded-md border border-border">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <div>
            <div className="font-semibold text-[0.8rem]">Cloud Storage</div>
            <div className="text-[0.7rem] text-success">Connected</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2 text-danger bg-danger/5 hover:bg-danger/10 hover:text-danger rounded-md text-[0.85rem] font-semibold transition-all border border-danger/10 hover:border-danger/20 w-full"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
    </>
  );
}
