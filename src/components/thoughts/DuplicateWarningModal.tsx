"use client";

import React from "react";
import { AlertTriangle, ArrowLeft, Send } from "lucide-react";

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onGoBack: () => void;
  onSubmitAnyway: () => void;
  submitting?: boolean;
}

export function DuplicateWarningModal({
  isOpen,
  onGoBack,
  onSubmitAnyway,
  submitting = false,
}: DuplicateWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-warning-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-bg-surface border border-border-strong shadow-2xl p-6 text-text-primary space-y-5">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2
            id="duplicate-warning-title"
            className="font-serif text-2xl font-medium text-text-primary"
          >
            Similar Words Discovered
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            It looks like this thought has already been shared by someone else.
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            Different people often experience the exact same human feelings. You are
            completely welcome to share it anyway, or refine your words if you wish.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onGoBack}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go back</span>
          </button>

          <button
            type="button"
            onClick={onSubmitAnyway}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Submit anyway</span>
          </button>
        </div>
      </div>
    </div>
  );
}
