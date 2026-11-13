"use client";

import React, { useState } from "react";
import { AlertCircle, X, Check, Loader2, Flag } from "lucide-react";

interface ReportModalProps {
  thoughtId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: "harassment", label: "Targeted harassment or bullying" },
  { id: "threats", label: "Threats of violence or danger" },
  { id: "harmful_encouragement", label: "Encouraging self-harm or suicide" },
  { id: "privacy_violation", label: "Sharing private identifying details (Doxxing)" },
  { id: "spam", label: "Spam, repetitive ads or bot content" },
  { id: "other", label: "Other guideline violation" },
];

export function ReportModal({ thoughtId, isOpen, onClose }: ReportModalProps) {
  const [category, setCategory] = useState("harassment");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/thoughts/${thoughtId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report.");
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setDescription("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-bg-surface border border-border-strong shadow-2xl p-6 text-text-primary">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-sage-muted text-sage flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-medium text-text-primary">
              Report Submitted Discreetly
            </h3>
            <p className="text-sm text-text-secondary">
              Thank you for keeping UnSpoken a safe and compassionate space. Our team will review this shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 text-terracotta">
              <Flag className="w-5 h-5" />
              <h2 id="report-modal-title" className="font-serif text-xl font-medium text-text-primary">
                Discreet Content Review
              </h2>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              We take safety seriously. Your report is completely confidential and the author will never know who reported it.
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Reason for reporting
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                      category === r.id
                        ? "border-terracotta bg-terracotta-muted/30 text-text-primary font-medium"
                        : "border-border-subtle bg-bg-elevated/40 text-text-secondary hover:border-border-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={category === r.id}
                      onChange={(e) => setCategory(e.target.value)}
                      className="accent-terracotta"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Additional context (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Help us understand the issue..."
                rows={3}
                className="w-full rounded-lg bg-input-bg border border-border-subtle p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-terracotta resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
