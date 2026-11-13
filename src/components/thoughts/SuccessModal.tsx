"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, CheckCheck, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  deletionToken: string;
  isHeld?: boolean;
  onClose: () => void;
  onReset: () => void;
}

export function SuccessModal({
  isOpen,
  deletionToken,
  isHeld = false,
  onClose,
  onReset,
}: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(deletionToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-bg-surface border border-border-strong shadow-2xl p-6 sm:p-8 text-text-primary space-y-6">
        <div className="w-14 h-14 rounded-full bg-sage-muted text-sage flex items-center justify-center mx-auto">
          <Check className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <h2
            id="success-modal-title"
            className="font-serif text-2xl sm:text-3xl font-medium text-text-primary"
          >
            {isHeld ? "Your words have been received" : "Your words have been released"}
          </h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            {isHeld
              ? "Because our safety guidelines flagged sensitive phrases, a moderator will discreetly review your thought before it appears publicly."
              : "Thank you for trusting this quiet sanctuary. Your identity remains completely private."}
          </p>
        </div>

        {/* Cryptographic Deletion Credential Card */}
        <div className="rounded-xl border border-border-strong bg-bg-elevated p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta">
            <KeyRound className="w-4 h-4" />
            <span>Your Private Deletion Key</span>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Because you do not have an account, this random secret key is your{" "}
            <strong>only proof of ownership</strong>. We do not store this key (only its one-way hash).
            Save it now if you ever want to delete your thought in the future.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-lg bg-input-bg border border-border-subtle font-mono text-xs text-text-primary select-all break-all">
              {deletionToken}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors shrink-0"
              aria-label="Copy secret deletion key to clipboard"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-center"
          >
            Write another thought
          </button>

          <Link
            href="/explore"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors"
          >
            <span>Read other stories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
