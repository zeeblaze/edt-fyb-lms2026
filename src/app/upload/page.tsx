"use client";

import { useEffect, useState, useRef } from "react";
import { UploadCloud, File, AlertCircle, Info, FileText } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client (only runs on the browser)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Upload() {
  const [courses, setCourses] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(console.error);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (f: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    if (!allowedTypes.includes(f.type)) {
      setError("Only PDF, Word, PowerPoint, and Text documents are allowed.");
      return;
    }
    setFile(f);
    setError("");
  };

  const formatBytes = (bytes: number) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) {
      setError("Please select a target level.");
      return;
    }
    
    if (!file) {
      setError("Please select a file.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds the 50MB limit. Please choose a smaller file.");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const courseId = formData.get("courseId") as string;
    
    setUploading(true);
    setProgress(10);
    setError("");
    setSuccess("");

    try {
      // 1. Get Supabase Signed Upload URL
      const urlRes = await fetch(`/api/courses/${courseId}/materials/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      
      if (!urlRes.ok) throw new Error("Failed to get secure upload URL from server");
      const { signedUrl, token, supabasePath } = await urlRes.json();
      setProgress(30);

      // 2. Upload to Supabase Storage directly using the signed URL
      const { error: uploadError } = await supabase.storage
        .from('materials')
        .uploadToSignedUrl(supabasePath, token, file);
      
      if (uploadError) throw new Error(`Failed to upload file to Cloud Storage: ${uploadError.message}`);
      setProgress(80);

      // 3. Save metadata to DB
      const metaRes = await fetch(`/api/courses/${courseId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabasePath,
          title: formData.get("title"),
          description: formData.get("description"),
          uploadedBy: formData.get("uploadedBy"),
          filename: file.name,
          originalName: file.name,
          mimetype: file.type,
          size: file.size
        })
      });

      if (!metaRes.ok) throw new Error("Failed to save file metadata");
      
      setProgress(100);
      setSuccess("Document uploaded successfully to Cloud Storage!");
      setFile(null);
      setSelectedCourse(null);
      formRef.current?.reset();

    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-8">
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2" ref={dropdownRef}>
            <label className="font-semibold text-[0.8rem] text-text-muted uppercase tracking-wider">Target Level <span className="text-danger">*</span></label>
            <div className="relative">
              <input type="hidden" name="courseId" value={selectedCourse?.id || ""} required />
              
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full bg-bg-dark border-2 rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all shadow-sm
                  ${isDropdownOpen ? 'border-primary bg-bg-card shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-border/50 hover:border-primary/50'}
                `}
              >
                {selectedCourse ? (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCourse.color }}></div>
                    <span className="font-bold text-text-main">{selectedCourse.title}</span>
                  </div>
                ) : (
                  <span className="font-semibold text-text-muted">Select an academic level...</span>
                )}
                <div className={`text-primary transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-[slideUp_0.2s_ease-out]">
                  {courses.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => {
                        setSelectedCourse(c);
                        setIsDropdownOpen(false);
                      }}
                      className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-bg-dark border-b border-border/50 last:border-0 transition-colors"
                    >
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: c.color }}></div>
                      <div>
                        <div className="font-bold text-text-main text-[0.95rem] leading-tight">{c.title}</div>
                        <div className="text-[0.7rem] text-text-muted font-semibold uppercase tracking-wider mt-0.5">{c.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Material Title <span className="text-danger">*</span></label>
            <input name="title" required type="text" defaultValue={file?.name.replace(/\.[^/.]+$/, "")} placeholder="e.g. Chapter 1 Lecture Notes" className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all" />
          </div>

          {!file ? (
            <div 
              className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-center justify-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <UploadCloud size={48} className="text-primary mb-3" />
              <div className="font-bold text-lg mb-1">Click or drag file to this area to upload</div>
              <div className="text-sm text-text-muted mb-4">Support for a single or bulk upload. Only PDFs and Office documents are permitted. Unlimited file size.</div>
              <div className="flex gap-2 flex-wrap justify-center text-xs font-semibold text-primary/70 mb-2">
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">PDF</span>
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">DOCX</span>
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">PPTX</span>
                <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">TXT</span>
              </div>
              <div className="text-xs text-text-muted">Unlimited file size up to Drive quota</div>
              <input id="file-upload" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" type="file" className="hidden" onChange={(e) => e.target.files?.length && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-lg p-4 animate-[slideUp_0.3s_ease]">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{file.name}</div>
                <div className="text-xs text-text-muted">{formatBytes(file.size)}</div>
              </div>
              <button type="button" onClick={() => setFile(null)} className="text-text-muted hover:text-danger p-2">✕</button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Description (Optional)</label>
            <textarea name="description" rows={3} placeholder="Add any notes about this material..." className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all resize-y"></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Uploaded By <span className="text-danger">*</span></label>
            <input name="uploadedBy" required type="text" placeholder="Your name or ID" className="bg-bg-dark border border-border rounded-md px-4 py-3 outline-none focus:border-primary transition-all" />
          </div>

          {error && <div className="text-danger bg-danger/10 border border-danger/20 p-3 rounded-md text-sm flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
          {success && <div className="text-success bg-success/10 border border-success/20 p-3 rounded-md text-sm flex items-center gap-2"><File size={16} /> {success}</div>}

          {uploading && (
            <div className="mb-4">
              <div className="h-2 bg-primary/20 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="text-right text-xs text-text-muted">Uploading to cloud… {progress}%</div>
            </div>
          )}

          <button disabled={uploading || !file} type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] transition-all text-white font-semibold py-3 rounded-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
            <UploadCloud size={20} /> {uploading ? 'Uploading...' : 'Upload to Cloud'}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 text-lg font-bold mb-4 font-space">
            <Info className="text-accent" /> Information
          </div>
          <ul className="text-sm text-text-muted space-y-3 pl-4 list-disc marker:text-border">
            <li>Select a level before uploading to ensure the material is organized correctly.</li>
            <li>Files are uploaded directly to your configured Supabase Storage bucket.</li>
            <li>Maximum file size is 50MB per document.</li>
            <li>Only PDFs and Documents (Word, PowerPoint, Text) are allowed.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
