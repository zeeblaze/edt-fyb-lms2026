"use client";

import { useEffect, useState } from "react";
import { Megaphone, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchAnnouncements = () => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body })
      });
      if (!res.ok) throw new Error("Failed to post announcement");
      
      setMsg({ type: 'success', text: 'Announcement posted!' });
      setTitle("");
      setBody("");
      fetchAnnouncements();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const deleteAnn = async (id: string) => {
    if (!confirm('Delete announcement?')) return;
    try {
      await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-bg-card border border-border rounded-xl p-8 h-fit">
        <h2 className="text-xl font-bold font-space mb-6 pb-4 border-b border-border flex items-center gap-2">
          <Megaphone className="text-warning" /> New Announcement
        </h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Title</label>
            <input 
              required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Server Maintenance" 
              className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Message</label>
            <textarea 
              required value={body} onChange={(e) => setBody(e.target.value)}
              rows={5} placeholder="Write your announcement here..." 
              className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all resize-y"
            ></textarea>
          </div>

          {msg.text && (
            <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${msg.type === 'error' ? 'text-danger bg-danger/10 border border-danger/20' : 'text-success bg-success/10 border border-success/20'}`}>
              {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] transition-all text-white font-semibold py-3 rounded-md disabled:opacity-50">
            {loading ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-text-muted border border-dashed border-border rounded-lg bg-bg-main/30">
            <Megaphone size={48} className="mx-auto mb-4 opacity-50" />
            <p>No announcements yet.</p>
          </div>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="bg-bg-card border border-border border-l-4 border-l-primary rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="font-bold text-lg">{a.title}</div>
                <div className="text-xs text-text-muted">{new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap">{a.body}</div>
              <button 
                onClick={() => deleteAnn(a.id)}
                className="mt-4 flex items-center gap-1.5 text-xs text-text-muted hover:text-danger px-2 py-1.5 rounded hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
