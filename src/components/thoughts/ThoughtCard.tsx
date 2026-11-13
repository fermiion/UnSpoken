"use client";

import React, { useState } from "react";
import { PublicThought, ReactionType } from "@/lib/services/thoughtService";
import { ReportModal } from "./ReportModal";
import { DeleteModal } from "./DeleteModal";
import {
  Heart,
  Users,
  SunMedium,
  CheckCircle2,
  MoreHorizontal,
  Flag,
  Trash2,
  Clock,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ThoughtCardProps {
  thought: PublicThought;
  onDeleted?: (id: string) => void;
  className?: string;
}

// Category labels
const CATEGORY_MAP: Record<string, string> = {
  unspoken: "Unspoken Thoughts",
  loneliness: "Loneliness",
  relationships: "Relationships",
  life: "Life",
  "personal-growth": "Personal Growth",
  "things-left-unsaid": "Things Left Unsaid",
  hope: "Hope",
};

// Format relative time calmly
function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diffSeconds = Math.max(0, Math.floor((now - date) / 1000));

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

// Long thought threshold before showing comfortable fold toggle
const LONG_CONTENT_CHAR_THRESHOLD = 900;

export function ThoughtCard({
  thought,
  onDeleted,
  className = "",
}: ThoughtCardProps) {
  const [reactions, setReactions] = useState(
    thought.reactions_count || {
      hear_you: 0,
      not_alone: 0,
      warmth: 0,
      understand: 0,
    }
  );
  const [userReacted, setUserReacted] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reacting, setReacting] = useState<string | null>(null);

  // Accessible expand/collapse for very lengthy stories
  const isLengthy = thought.content.length > LONG_CONTENT_CHAR_THRESHOLD;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReact = async (type: ReactionType) => {
    if (reacting || userReacted[type]) return;

    setReacting(type);
    // Optimistic update
    setReactions((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));
    setUserReacted((prev) => ({ ...prev, [type]: true }));

    try {
      const res = await fetch(`/api/thoughts/${thought.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: type }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.newCount === "number") {
          setReactions((prev) => ({
            ...prev,
            [type]: data.newCount,
          }));
        }
      }
    } catch {
      // Retain optimistic update
    } finally {
      setReacting(null);
    }
  };

  const reactionButtons: {
    type: ReactionType;
    label: string;
    icon: React.ElementType;
    activeColor: string;
  }[] = [
    {
      type: "hear_you",
      label: "I hear you",
      icon: Heart,
      activeColor: "text-terracotta border-terracotta/40 bg-terracotta-muted/40",
    },
    {
      type: "not_alone",
      label: "You're not alone",
      icon: Users,
      activeColor: "text-sage border-sage/40 bg-sage-muted/40",
    },
    {
      type: "warmth",
      label: "Sending warmth",
      icon: SunMedium,
      activeColor: "text-amber-500 border-amber-500/40 bg-amber-500/15",
    },
    {
      type: "understand",
      label: "I understand",
      icon: CheckCircle2,
      activeColor: "text-terracotta border-terracotta/40 bg-terracotta-muted/40",
    },
  ];

  // Split content into clean paragraphs while preserving line breaks
  const paragraphs = thought.content.split(/\n\s*\n/);

  return (
    <>
      <article
        className={`group relative rounded-2xl bg-bg-surface border border-border-subtle hover:border-border-strong p-6 sm:p-8 transition-all duration-200 shadow-xs hover:shadow-md ${className}`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 text-xs text-text-muted mb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-elevated border border-border-subtle text-text-secondary text-xs font-medium">
              <Sparkles className="w-3 h-3 text-terracotta" />
              <span>{CATEGORY_MAP[thought.category] || "Unspoken Thought"}</span>
            </span>

            {thought.is_demonstration && (
              <span className="text-[10px] uppercase tracking-wider text-text-muted px-2 py-0.5 rounded-md bg-bg-elevated/70 border border-border-subtle">
                Demo sample
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-text-muted text-xs">
              <Clock className="w-3 h-3" />
              <time dateTime={thought.created_at}>
                {formatRelativeTime(thought.created_at)}
              </time>
            </span>
          </div>

          {/* Options Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
              aria-label="Thought options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-48 rounded-xl bg-bg-elevated border border-border-strong shadow-xl py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setReportModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface text-left transition-colors cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 text-text-muted" />
                    <span>Report thought</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-text-secondary hover:text-red-400 hover:bg-bg-surface text-left transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>I am the author (Delete)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Thought Main Content in Lora serif with complete paragraph spacing */}
        <div className="mb-6 relative">
          <div
            className={`space-y-4 font-serif text-lg sm:text-xl text-text-primary leading-relaxed font-normal select-text ${
              isLengthy && !isExpanded
                ? "max-h-[380px] overflow-hidden mask-gradient-b"
                : ""
            }`}
          >
            {paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>

          {/* Accessible Expand/Collapse Button for lengthy stories */}
          {isLengthy && (
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline cursor-pointer py-1"
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Read full story</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Card Footer: Metadata and Reactions */}
        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-text-muted flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sage" />
            <span>Shared anonymously</span>
          </div>

          {/* Supportive Reactions Grid */}
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Supportive reactions"
          >
            {reactionButtons.map((btn) => {
              const Icon = btn.icon;
              const count = reactions[btn.type] || 0;
              const isSelected = userReacted[btn.type];

              return (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => handleReact(btn.type)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? btn.activeColor
                      : "border-border-subtle bg-bg-elevated/60 text-text-secondary hover:text-text-primary hover:border-border-strong active:scale-95"
                  }`}
                  aria-label={`${btn.label} (${count} responses)`}
                  title={btn.label}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "fill-current" : ""
                    }`}
                  />
                  <span>{btn.label}</span>
                  {count > 0 && (
                    <span className="font-mono text-[11px] opacity-80 ml-0.5">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </article>

      {/* Modals */}
      <ReportModal
        thoughtId={thought.id}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <DeleteModal
        thoughtId={thought.id}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDeleted={(id) => onDeleted?.(id)}
      />
    </>
  );
}
