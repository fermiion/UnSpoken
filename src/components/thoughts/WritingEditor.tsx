"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SuccessModal } from "./SuccessModal";
import { ClearDraftModal } from "./ClearDraftModal";
import { CrisisSupportBanner } from "@/components/common/CrisisSupportBanner";
import {
  Feather,
  Send,
  Loader2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Check,
  Heart,
  X,
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

// Generous technical safety ceiling (100,000 characters) - not displayed to users
const TECHNICAL_SAFETY_CEILING = 100000;

// Local storage key for draft persistence
const DRAFT_STORAGE_KEY = "unspoken_writing_draft_v1";

interface WritingDraft {
  content: string;
  category: string;
  savedAt: number;
}

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

  // Draft management state
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearedMessage, setClearedMessage] = useState<string | null>(null);

  // Success state
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [deletionToken, setDeletionToken] = useState("");
  const [isHeld, setIsHeld] = useState(false);

  // Crisis detection state
  const [crisisMessage, setCrisisMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed: WritingDraft = JSON.parse(saved);
          if (
            parsed &&
            typeof parsed.content === "string" &&
            parsed.content.trim().length > 0
          ) {
            setContent(parsed.content);
            if (parsed.category) {
              setCategory(parsed.category);
            }
            setSaveStatus("saved");
          }
        }
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Automatically persist draft with debounce as user writes
  useEffect(() => {
    if (!isInitialized) return;

    if (content.trim().length === 0) {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch (err) {
        console.error("Failed to remove empty draft:", err);
      }
      setSaveStatus("idle");
      return;
    }

    setSaveStatus("saving");

    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          const draft: WritingDraft = {
            content,
            category,
            savedAt: Date.now(),
          };
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
          setSaveStatus("saved");
        }
      } catch (err) {
        console.error("Failed to save draft:", err);
        setSaveStatus("idle");
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [content, category, isInitialized]);

  // Auto-expand textarea naturally as content grows
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const minHeight = isStandalonePage ? 240 : 170;
      textarea.style.height = `${Math.max(minHeight, textarea.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content, isStandalonePage]);

  const isTooShort = content.trim().length < 3;
  const isOverCeiling = content.length > TECHNICAL_SAFETY_CEILING;

  const handleSubmit = async () => {
    if (isTooShort) {
      setError("Please write at least a few words to share.");
      return;
    }
    if (isOverCeiling) {
      setError(
        "Your reflection has reached the technical safety ceiling. If possible, consider sharing it in parts so nothing is lost."
      );
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to share thought.");
      }

      // Success - clear draft from localStorage
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch (err) {
        console.error("Failed to clear submitted draft:", err);
      }
      setSaveStatus("idle");

      setDeletionToken(data.deletionToken);
      setIsHeld(data.status === "held");
      if (data.crisisDetected && data.crisisMessage) {
        setCrisisMessage(data.crisisMessage);
      }
      setSuccessModalOpen(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmClear = () => {
    setContent("");
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Failed to clear draft storage:", err);
    }
    setSaveStatus("idle");
    setClearModalOpen(false);
    setError(null);
    setCrisisMessage(null);
    setClearedMessage(
      "Thank you for giving your thoughts a place to land. You don't have to share them to let them matter."
    );
  };

  const handleReset = () => {
    setContent("");
    setCategory("unspoken");
    setSuccessModalOpen(false);
    setDeletionToken("");
    setError(null);
    setCrisisMessage(null);
    setClearedMessage(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Failed to reset draft storage:", err);
    }
    setSaveStatus("idle");
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
              What&apos;s been on your mind lately? Take all the space you need.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {saveStatus === "saving" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border-subtle text-[11px] text-text-muted animate-in fade-in duration-150">
                <Loader2 className="w-3 h-3 animate-spin text-terracotta" />
                <span>Saving draft...</span>
              </span>
            )}
            {saveStatus === "saved" && content.trim().length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-muted/30 border border-sage/20 text-[11px] text-sage animate-in fade-in duration-150">
                <Check className="w-3 h-3 text-sage" />
                <span>Draft saved</span>
              </span>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-sage shrink-0" />
              <span>Completely anonymous</span>
            </div>
          </div>
        </div>

        {/* Compassionate post-clearing message */}
        {clearedMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-terracotta-muted/30 border border-terracotta/20 text-xs sm:text-sm text-text-secondary flex items-start justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <p className="leading-relaxed font-serif italic text-text-primary/90">
                {clearedMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setClearedMessage(null)}
              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
            Theme (optional)
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

        {/* Journal Writing Textarea with Auto-Expansion */}
        <div className="space-y-2.5 mb-5">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
              if (clearedMessage) setClearedMessage(null);
            }}
            placeholder="What's been on your mind lately? Write as much as you need, in your own time..."
            rows={isStandalonePage ? 10 : 7}
            className="w-full rounded-2xl bg-input-bg border border-border-subtle focus:border-terracotta p-4 sm:p-5 text-base sm:text-lg font-serif text-text-primary placeholder:font-sans placeholder:text-text-muted placeholder:text-sm focus:outline-none transition-colors resize-none leading-relaxed overflow-hidden"
          />

          {/* Quiet footer notes - No visible restrictive character counter */}
          <div className="flex items-center justify-between text-xs text-text-muted px-1">
            <Link
              href="/guidelines"
              className="hover:text-text-secondary inline-flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sage" />
              <span>Community guidelines</span>
            </Link>

            <span className="text-xs text-text-muted">
              Preserving formatting &amp; paragraphs
            </span>
          </div>
        </div>

        {/* Footer Actions with Clear/Leave Option */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>Your identity stays hidden. You receive a private deletion key.</span>
            {content.length > 0 && (
              <button
                type="button"
                onClick={() => setClearModalOpen(true)}
                className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary underline cursor-pointer"
                title="Clear current draft"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear draft</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || isTooShort || isOverCeiling}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] cursor-pointer shrink-0"
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

      {/* Compassionate Clear Draft Confirmation Modal */}
      <ClearDraftModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirmClear={handleConfirmClear}
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
