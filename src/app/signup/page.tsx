"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, Loader2, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const ALLOWED_DOMAINS = ['futminna.edu.ng', 'st.futminna.edu.ng'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!ALLOWED_DOMAINS.includes(emailDomain)) {
      setError('Only FUTMinna institution mail addresses are allowed to register.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccessMessage(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-[900px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-3xl font-bold font-space text-text-main mb-2">Create Account</h1>
            <p className="text-text-muted text-sm">
              Register with your institution mail
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          {/* Success state */}
          {successMessage ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 bg-success/10 text-success rounded-full flex items-center justify-center border border-success/20">
                <CheckCircle2 size={30} />
              </div>
              <p className="text-text-main text-center font-medium">{successMessage}</p>
              <Link
                href="/login"
                className="mt-2 w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-2 transition-all group"
              >
                Go to Login
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    id="signup-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-bg-dark border border-border rounded-xl py-3 pl-10 pr-4 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted/50"
                    placeholder="e.g. Habib Musa"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main ml-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    id="signup-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-bg-dark border border-border rounded-xl py-3 pl-10 pr-4 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted/50"
                    placeholder="you@futminna.edu.ng or you@st.futminna.edu.ng"
                    required
                  />
                </div>
                <p className="text-xs text-text-muted ml-1">Must be a valid FUTMinna staff or student email address</p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main ml-1">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    id="signup-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-dark border border-border rounded-xl py-3 pl-10 pr-4 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted/50"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main ml-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    id="signup-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-bg-dark border border-border rounded-xl py-3 pl-10 pr-4 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted/50"
                    placeholder="Re-enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="signup-submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Link to login */}
          {!successMessage && (
            <p className="mt-6 text-center text-sm text-text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline transition-all"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
