"use client";

import { useEffect, useState } from "react";
import { BookOpen, FileText, HardDrive, Download, Eye } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  const formatBytes = (bytes: number) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext!)) return 'bg-danger';
    if (['mp4', 'webm'].includes(ext!)) return 'bg-blue-500';
    if (['jpg', 'png'].includes(ext!)) return 'bg-success';
    return 'bg-slate-500';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-primary transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-all"></div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 border border-primary/20">
            <BookOpen size={24} />
          </div>
          <div className="text-3xl font-bold font-space mb-1">{stats?.totalCourses ?? '-'}</div>
          <div className="text-sm text-text-muted font-medium">Active Courses</div>
        </div>
        
        <div className="bg-bg-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-accent transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full group-hover:bg-accent/10 transition-all"></div>
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center mb-4 border border-accent/20">
            <FileText size={24} />
          </div>
          <div className="text-3xl font-bold font-space mb-1">{stats?.totalMaterials ?? '-'}</div>
          <div className="text-sm text-text-muted font-medium">Total Materials</div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-success transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-bl-full group-hover:bg-success/10 transition-all"></div>
          <div className="w-12 h-12 bg-success/10 text-success rounded-lg flex items-center justify-center mb-4 border border-success/20">
            <HardDrive size={24} />
          </div>
          <div className="text-3xl font-bold font-space mb-1">{stats ? formatBytes(stats.totalSize) : '-'}</div>
          <div className="text-sm text-text-muted font-medium">Storage Used</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Uploads */}
        <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h2 className="text-xl font-bold font-space flex items-center gap-2">
              <UploadCloud className="text-primary" /> Recent Uploads
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {!stats?.recentMaterials?.length ? (
              <div className="text-center py-8 text-text-muted border border-dashed border-border rounded-lg bg-bg-main/30">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>No recent uploads.</p>
                <Link href="/upload" className="text-primary mt-2 inline-block font-medium hover:underline">Upload your first material</Link>
              </div>
            ) : (
              stats.recentMaterials.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-bg-dark rounded-lg border border-transparent hover:border-border transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded text-white flex items-center justify-center ${getFileIcon(m.filename)}`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">{m.title}</div>
                      <div className="text-xs text-text-muted">
                        {new Date(m.uploadedAt).toLocaleDateString()} • {formatBytes(m.size)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-text-muted hover:text-text-main hover:bg-bg-card-hover rounded transition-colors"><Eye size={18} /></button>
                    <button className="p-2 text-text-muted hover:text-text-main hover:bg-bg-card-hover rounded transition-colors"><Download size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-bg-card border border-border rounded-xl p-6 h-fit">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <h2 className="text-xl font-bold font-space">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/upload" className="flex flex-col items-center gap-3 p-4 bg-bg-dark border border-border rounded-lg text-center hover:border-primary hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                <UploadCloud size={24} />
              </div>
              <span className="font-semibold text-sm">Upload Material</span>
            </Link>
            <Link href="/manage" className="flex flex-col items-center gap-3 p-4 bg-bg-dark border border-border rounded-lg text-center hover:border-accent hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <span className="font-semibold text-sm">Create Course</span>
            </Link>
            <Link href="/announcements" className="flex flex-col items-center gap-3 p-4 bg-bg-dark border border-border rounded-lg text-center hover:border-warning hover:-translate-y-0.5 transition-all">
              <div className="w-12 h-12 bg-warning/20 text-warning rounded-full flex items-center justify-center">
                <Megaphone size={24} />
              </div>
              <span className="font-semibold text-sm">Post Announcement</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Needed to make the icon available if using variables
import { UploadCloud, Megaphone } from "lucide-react";
