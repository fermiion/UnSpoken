"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Thought, Report } from "@/lib/services/thoughtService";
import {
  ShieldAlert,
  Lock,
  KeyRound,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Database,
  Trash2,
  RefreshCw,
  LogOut,
  Sparkles,
} from "lucide-react";

interface AdminStats {
  totalPublished: number;
  pendingHeld: number;
  pendingReports: number;
  totalRemoved: number;
}

interface ModerationQueue {
  heldThoughts: Thought[];
  reports: (Report & { thought?: any })[];
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dashboard Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dbStatus, setDbStatus] = useState<{ isSupabase: boolean; provider: string } | null>(null);
  const [queue, setQueue] = useState<ModerationQueue | null>(null);
  const [activeTab, setActiveTab] = useState<"held" | "reports">("held");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      setAuthenticated(data.authenticated);
      if (data.authenticated) {
        loadDashboardData();
      }
    } catch {
      setAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setAuthenticated(true);
      setPasscode("");
      loadDashboardData();
    } catch (err: any) {
      setAuthError(err.message || "Invalid administrative passcode.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setStats(null);
    setQueue(null);
  };

  const loadDashboardData = async () => {
    try {
      const [statsRes, queueRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/queue"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setDbStatus(statsData.dbStatus);
      }

      if (queueRes.ok) {
        const queueData = await queueRes.json();
        setQueue(queueData);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  const handleModerateThought = async (thoughtId: string, decision: "approved" | "removed") => {
    setActionInProgress(thoughtId);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "thought",
          thoughtId,
          decision,
          notes: `Admin manual ${decision}`,
        }),
      });

      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error("Moderation action failed:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleResolveReport = async (reportId: string, action: "dismiss" | "remove_content") => {
    setActionInProgress(reportId);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "report",
          reportId,
          action,
          notes: `Admin resolved report with ${action}`,
        }),
      });

      if (res.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error("Report action failed:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // If checking authentication
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12">
        {!authenticated ? (
          /* LOGIN SCREEN */
          <div className="max-w-md mx-auto my-12 rounded-2xl bg-bg-surface border border-border-strong p-8 shadow-xl space-y-6">
            <div className="w-12 h-12 rounded-xl bg-terracotta-muted text-terracotta flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-serif text-2xl font-medium text-text-primary">
                Protected Moderation Portal
              </h1>
              <p className="text-xs text-text-secondary leading-relaxed">
                Authorized staff access only. Server-side cryptographically signed session.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Administrative Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secret passcode..."
                  className="w-full rounded-xl bg-input-bg border border-border-subtle p-3 text-sm text-text-primary focus:outline-none focus:border-terracotta"
                  autoFocus
                />
                <p className="text-[11px] text-text-muted">
                  Default developer key: <code>unspoken-admin-safe-2026</code> (configurable via <code>ADMIN_SECRET_KEY</code>)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !passcode.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Authenticate</span>
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="space-y-8">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sage">
                  Safety Operations
                </span>
                <h1 className="font-serif text-3xl font-normal text-text-primary mt-1">
                  Moderation Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadDashboardData}
                  className="p-2 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-surface border border-border-subtle text-xs text-text-secondary hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Database Status Alert */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-bg-surface border border-border-subtle text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-terracotta" />
                <span className="text-text-secondary">Connected Storage:</span>
                <span className="font-semibold text-text-primary">
                  {dbStatus?.provider || "Supabase PostgreSQL"}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  dbStatus?.isSupabase
                    ? "bg-sage-muted text-sage"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {dbStatus?.isSupabase ? "Production PostgreSQL" : "Local Storage Mode"}
              </span>
            </div>

            {/* Metric Cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-bg-surface border border-border-subtle p-5 space-y-1">
                  <span className="text-xs text-text-muted">Total Published</span>
                  <div className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
                    {stats.totalPublished}
                  </div>
                </div>

                <div className="rounded-xl bg-bg-surface border border-border-subtle p-5 space-y-1">
                  <span className="text-xs text-text-muted">Held for Review</span>
                  <div className="font-serif text-2xl sm:text-3xl font-medium text-amber-500">
                    {stats.pendingHeld}
                  </div>
                </div>

                <div className="rounded-xl bg-bg-surface border border-border-subtle p-5 space-y-1">
                  <span className="text-xs text-text-muted">Pending Reports</span>
                  <div className="font-serif text-2xl sm:text-3xl font-medium text-red-400">
                    {stats.pendingReports}
                  </div>
                </div>

                <div className="rounded-xl bg-bg-surface border border-border-subtle p-5 space-y-1">
                  <span className="text-xs text-text-muted">Removed Content</span>
                  <div className="font-serif text-2xl sm:text-3xl font-medium text-text-secondary">
                    {stats.totalRemoved}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-4 border-b border-border-subtle">
              <button
                type="button"
                onClick={() => setActiveTab("held")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "held"
                    ? "border-terracotta text-terracotta"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Held Thoughts Queue ({queue?.heldThoughts.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "reports"
                    ? "border-terracotta text-terracotta"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Reported Submissions ({queue?.reports.length || 0})
              </button>
            </div>

            {/* Tab 1: Held Thoughts */}
            {activeTab === "held" && (
              <div className="space-y-4">
                {queue && queue.heldThoughts.length > 0 ? (
                  queue.heldThoughts.map((thought) => (
                    <div
                      key={thought.id}
                      className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                          Held for Safety Check
                        </span>
                        <time>{new Date(thought.created_at).toLocaleString()}</time>
                      </div>

                      <p className="font-serif text-lg text-text-primary leading-relaxed whitespace-pre-wrap">
                        {thought.content}
                      </p>

                      <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={actionInProgress === thought.id}
                          onClick={() => handleModerateThought(thought.id, "removed")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject &amp; Remove</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionInProgress === thought.id}
                          onClick={() => handleModerateThought(thought.id, "approved")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-sage text-bg-primary hover:opacity-90 transition-opacity"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve &amp; Publish</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 rounded-2xl bg-bg-surface border border-border-subtle p-8 text-sm text-text-secondary">
                    <Sparkles className="w-8 h-8 text-sage mx-auto mb-2 opacity-60" />
                    <p>The held review queue is currently empty.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Reports Queue */}
            {activeTab === "reports" && (
              <div className="space-y-4">
                {queue && queue.reports.length > 0 ? (
                  queue.reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 font-semibold uppercase">
                          Report Category: {report.category}
                        </span>
                        <time className="text-text-muted">
                          {new Date(report.created_at).toLocaleString()}
                        </time>
                      </div>

                      {report.description && (
                        <div className="p-3 rounded-lg bg-bg-elevated text-xs text-text-secondary italic">
                          Reporter Note: &ldquo;{report.description}&rdquo;
                        </div>
                      )}

                      {report.thought ? (
                        <div className="p-4 rounded-xl bg-bg-elevated/50 border border-border-subtle space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                            Reported Content:
                          </span>
                          <p className="font-serif text-base text-text-primary whitespace-pre-wrap">
                            {report.thought.content}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted italic">
                          (Referenced thought has already been deleted or removed)
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={actionInProgress === report.id}
                          onClick={() => handleResolveReport(report.id, "dismiss")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Keep Content &amp; Dismiss Report</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionInProgress === report.id}
                          onClick={() => handleResolveReport(report.id, "remove_content")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-red-700/80 hover:bg-red-700 text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Reported Content</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 rounded-2xl bg-bg-surface border border-border-subtle p-8 text-sm text-text-secondary">
                    <Sparkles className="w-8 h-8 text-sage mx-auto mb-2 opacity-60" />
                    <p>No pending reports. All reports have been resolved.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
