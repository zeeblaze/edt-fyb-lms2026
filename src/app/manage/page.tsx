"use client";

import { useEffect, useState } from "react";
import { Settings, Trash2, CheckCircle, AlertCircle } from "lucide-react";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", 
  "#f97316", "#eab308", "#22c55e", "#14b8a6", "#0ea5e9"
];

export default function ManageCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [desc, setDesc] = useState("");

  const fetchCourses = () => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, instructor, color, description: desc })
      });
      if (!res.ok) throw new Error("Failed to create course");
      
      setMsg({ type: 'success', text: 'Course created!' });
      setTitle(""); setCategory(""); setInstructor(""); setDesc(""); setColor(COLORS[0]);
      fetchCourses();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete course and ALL associated cloud materials?')) return;
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-bg-card border border-border rounded-xl p-8 h-fit">
        <h2 className="text-xl font-bold font-space mb-6 pb-4 border-b border-border flex items-center gap-2">
          <Settings className="text-accent" /> Create Course
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Course Title</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Intro to Computer Science" className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Category</label>
              <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. CS101" className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Instructor</label>
              <input required type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Name" className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Theme Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white ring-2 ring-border scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Description (Optional)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all resize-y"></textarea>
          </div>

          {msg.text && (
            <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${msg.type === 'error' ? 'text-danger bg-danger/10 border border-danger/20' : 'text-success bg-success/10 border border-success/20'}`}>
              {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] transition-all text-white font-semibold py-3 rounded-md disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-4">
        {courses.length === 0 ? (
          <div className="text-center py-12 text-text-muted border border-dashed border-border rounded-lg bg-bg-main/30">
            <Settings size={48} className="mx-auto mb-4 opacity-50" />
            <p>No courses yet.</p>
          </div>
        ) : (
          courses.map(c => (
            <div key={c.id} className="bg-bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: c.color }}></div>
                <div>
                  <div className="font-bold text-[1.1rem]">{c.title}</div>
                  <div className="text-xs text-text-muted">{c.category} • {c.instructor}</div>
                </div>
              </div>
              <button onClick={() => deleteCourse(c.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
