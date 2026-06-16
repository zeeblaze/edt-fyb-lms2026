"use client";

import { useEffect, useState, use } from "react";
import { User, FileText, Download, Eye, Trash2, ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<any>(null);
  const router = useRouter();

  const fetchCourse = () => {
    fetch(`/api/courses/${resolvedParams.id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setCourse(data))
      .catch(() => router.push('/courses'));
  };

  useEffect(() => {
    fetchCourse();
  }, [resolvedParams.id]);

  const deleteMaterial = async (matId: string) => {
    if (!confirm('Delete this material from cloud storage?')) return;
    try {
      await fetch(`/api/materials/${matId}`, { method: 'DELETE' });
      fetchCourse();
    } catch (e) {
      console.error(e);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext!)) return 'bg-danger';
    if (['mp4', 'webm'].includes(ext!)) return 'bg-blue-500';
    if (['jpg', 'png'].includes(ext!)) return 'bg-success';
    return 'bg-slate-500';
  };

  const formatBytes = (bytes: number) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (!course) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-border rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-border rounded col-span-2"></div><div className="h-2 bg-border rounded col-span-1"></div></div><div className="h-2 bg-border rounded"></div></div></div></div>;

  return (
    <div className="flex flex-col gap-8">
      <Link href="/courses" className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors w-fit font-medium text-sm">
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      <div className="bg-bg-card border border-border rounded-xl p-8 border-t-4" style={{ borderTopColor: course.color }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: course.color }}>{course.category}</div>
            <h2 className="text-3xl font-bold font-space leading-tight">{course.title}</h2>
            <div className="flex items-center gap-2 text-text-muted mt-2"><User size={16} /> {course.instructor}</div>
          </div>
          <Link href="/upload" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-md font-semibold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
            <UploadCloud size={18} /> Upload Material
          </Link>
        </div>
        {course.description && <p className="text-text-muted leading-relaxed mt-4 max-w-3xl">{course.description}</p>}
      </div>

      <div>
        <h3 className="text-xl font-bold font-space mb-4">Course Materials ({course.materials?.length || 0})</h3>
        <div className="flex flex-col gap-4">
          {!course.materials?.length ? (
            <div className="text-center py-12 text-text-muted border border-dashed border-border rounded-lg bg-bg-main/30">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No materials uploaded yet.</p>
            </div>
          ) : (
            course.materials.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-bg-dark rounded-lg border border-transparent hover:border-border transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded text-white flex items-center justify-center ${getFileIcon(m.filename)}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{m.title}</div>
                    <div className="text-xs text-text-muted">
                      {new Date(m.uploadedAt).toLocaleDateString()} • {m.uploadedBy} • {formatBytes(m.size)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-text-muted hover:text-text-main hover:bg-bg-card-hover rounded transition-colors"><Eye size={18} /></button>
                  <button className="p-2 text-text-muted hover:text-text-main hover:bg-bg-card-hover rounded transition-colors"><Download size={18} /></button>
                  <button onClick={() => deleteMaterial(m.id)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
