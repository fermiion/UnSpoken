"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DuplicateWarningModal } from "./DuplicateWarningModal";
import { SuccessModal } from "./SuccessModal";
import { CrisisSupportBanner } from "@/components/common/CrisisSupportBanner";
import {
  Feather,
  Send,
  Loader2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface WritingEditorProps {
  initialCategory?: string;
  isStandalonePage?: boolean;
  className?: string;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { id: "unspoken", label: "Unspoken Thoughts" },
  { id: "loneliness", label: "Loneliness" },
  { id: "relationships", label: "Relationships" },
  { id: "life", label: "Life" },
  { id: "personal-growth", label: "Personal Growth" },
  { id: "things-left-unsaid", label: "Things Left Unsaid" },
  { id: "hope", label: "Hope" },
];

const MAX_CHARS = 5000;

export function WritingEditor({
  initialCategory = "unspoken",
  isStandalonePage = false,
  className = "",
  onSuccess,
}: WritingEditorProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Duplicate detection state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

  // Success state
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [deletionToken, setDeletionToken] = useState("");
  const [isHeld, setIsHeld] = useState(false);

  // Crisis detection state
  const [crisisMessage, setCrisisMessage] = useState<string | null>(null);

  const charCount = content.length;
  const isTooLong = charCount > MAX_CHARS;
  const isTooShort = content.trim().length < 3;

  const handleSubmit = async (acknowledgeDuplicate = false) => {
    if (isTooShort) {
      setError("Please write at least a few words to share.");
      return;
    }
    if (isTooLong) {
      setError(`Thoughts are limited to ${MAX_CHARS.toLocaleString()} characters.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          category,
          acknowledgeDuplicate,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicateDetected) {
        setDuplicateModalOpen(true);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to share thought.");
      }

      // Success
      setDeletionToken(data.deletionToken);
      setIsHeld(data.status === "held");
      if (data.crisisDetected && data.crisisMessage) {
        setCrisisMessage(data.crisisMessage);
      }
      setDuplicateModalOpen(false);
      setSuccessModalOpen(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setContent("");
    setCategory("unspoken");
    setSuccessModalOpen(false);
    setDeletionToken("");
    setError(null);
    setCrisisMessage(null);
  };

  return (
    <>
      <div
        className={`rounded-3xl bg-bg-surface border border-border-subtle shadow-md p-6 sm:p-9 transition-colors duration-200 ${className}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-border-subtle">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary tracking-tight flex items-center gap-2.5">
              <Feather className="w-5 h-5 text-terracotta" />
              <span>Let it out.</span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              What&apos;s been on your mind lately? Nobody needs to know who you are.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-muted self-start sm:self-center">
            <ShieldCheck className="w-3.5 h-3.5 text-sage shrink-0" />
            <span>Completely anonymous</span>
          </div>
        </div>

        {/* Crisis Support Banner if detected */}
        {crisisMessage && (
          <CrisisSupportBanner message={crisisMessage} className="mb-6" />
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Category Selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
            Choose a theme (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  category === cat.id
                    ? "bg-terracotta-muted border-terracotta text-terracotta font-semibold"
                    : "bg-bg-elevated/50 border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Writing Textarea */}
        <div className="space-y-2.5 mb-5">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            placeholder="What's been on your mind lately? Start typing freely..."
            rows={isStandalonePage ? 11 : 7}
            maxLength={MAX_CHARS + 50}
            className={`w-full rounded-2xl bg-input-bg border p-4 sm:p-5 text-base sm:text-lg font-serif text-text-primary placeholder:font-sans placeholder:text-text-muted placeholder:text-sm focus:outline-none transition-colors resize-y leading-relaxed min-h-[170px] ${
              isTooLong
                ? "border-red-500 focus:border-red-500"
                : "border-border-subtle focus:border-terracotta"
            }`}
          />

          {/* Character Counter & Guidelines Note */}
          <div className="flex items-center justify-between text-xs text-text-muted px-1">
            <Link
              href="/guidelines"
              className="hover:text-text-secondary inline-flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sage" />
              <span>Community guidelines</span>
            </Link>

            <span className={`font-mono text-xs ${isTooLong ? "text-red-400 font-semibold" : ""}`}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted text-center sm:text-left">
            Your identity stays hidden from other visitors. You will receive a private deletion key.
          </p>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={submitting || isTooShort || isTooLong}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sharing softly...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Share anonymously</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Duplicate Detection Warning Modal */}
      <DuplicateWarningModal
        isOpen={duplicateModalOpen}
        submitting={submitting}
        onGoBack={() => setDuplicateModalOpen(false)}
        onSubmitAnyway={() => handleSubmit(true)}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModalOpen}
        deletionToken={deletionToken}
        isHeld={isHeld}
        onClose={() => setSuccessModalOpen(false)}
        onReset={handleReset}
      />
    </>
  );
}
