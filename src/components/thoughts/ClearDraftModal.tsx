"use client";

import React, { useEffect, useRef } from "react";
import { Heart, X } from "lucide-react";

interface ClearDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
}

export function ClearDraftModal({
  isOpen,
  onClose,
  onConfirmClear,
}: ClearDraftModalProps) {
  const keepButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard accessibility: Escape to close and autofocus safe action
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Focus safe "Keep my writing" button
    const timer = setTimeout(() => {
      keepButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-draft-title"
      aria-describedby="clear-draft-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-bg-surface border border-border-strong shadow-2xl p-7 sm:p-9 text-text-primary space-y-6">
        {/* Subtle Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Compassionate Header */}
        <div className="space-y-3 pt-1">
          <div className="w-10 h-10 rounded-xl bg-terracotta-muted flex items-center justify-center text-terracotta">
            <Heart className="w-5 h-5" />
          </div>

          <h2
            id="clear-draft-title"
            className="font-serif text-2xl sm:text-3xl font-medium text-text-primary tracking-tight leading-snug"
          >
            Not ready to share? That&apos;s okay.
          </h2>
        </div>

        {/* Compassionate Message */}
        <div
          id="clear-draft-description"
          className="font-serif text-text-secondary text-sm sm:text-base leading-relaxed space-y-3 font-light"
        >
          <p>
            Sometimes writing is all we need for the moment. You don&apos;t have to
            share every thought, explain every feeling, or find the perfect words.
            What you wrote still mattered, even if nobody else gets to read it.
          </p>
          <p className="text-text-primary/90">
            Take your time. Your feelings deserve space, whether you share them
            or keep them to yourself.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onConfirmClear}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-text-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150 cursor-pointer"
          >
            Clear my draft
          </button>

          <button
            ref={keepButtonRef}
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-all duration-150 shadow-sm active:scale-[0.98] cursor-pointer"
          >
            Keep my writing
          </button>
        </div>
      </div>
    </div>
  );
}
