"use client";

import { useEffect, useState } from "react";
import { Search, BookOpen, User, FileText } from "lucide-react";
import Link from "next/link";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(console.error);
  }, []);

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center bg-bg-card border border-border rounded-lg px-4 py-2 w-full max-w-sm">
        <input 
          type="text" 
          placeholder="Search courses..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-text-main flex-1 outline-none text-sm font-inter"
        />
        <Search className="text-text-muted w-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-text-muted border border-dashed border-border rounded-lg bg-bg-main/30">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>No courses found.</p>
          </div>
        ) : (
          filteredCourses.map(c => (
            <Link 
              href={`/courses/${c.id}`} 
              key={c.id}
              className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all"
              style={{ borderColor: `var(--color-${c.color?.replace('#', '')} border, ${c.color})` }}
            >
              <div className="h-2 w-full" style={{ backgroundColor: c.color }}></div>
              <div className="p-6 flex-1 flex flex-col hover:border-transparent transition-colors" style={{ '--tw-hover-border-color': c.color } as any}>
                <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: c.color }}>
                  {c.category}
                </div>
                <div className="text-xl font-bold font-space mb-2 leading-tight">{c.title}</div>
                <div className="text-sm text-text-muted mb-6 flex-1 line-clamp-3">{c.description || 'No description provided.'}</div>
                
                <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-text-muted">
                  <div className="flex items-center gap-1.5"><User size={14} /> {c.instructor}</div>
                  <div className="flex items-center gap-1.5"><FileText size={14} /> {c.materialCount} files</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
