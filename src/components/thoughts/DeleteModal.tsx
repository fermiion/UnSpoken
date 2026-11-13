"use client";

import React, { useState } from "react";
import { KeyRound, X, Check, Loader2, AlertCircle } from "lucide-react";

interface DeleteModalProps {
  thoughtId: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (thoughtId: string) => void;
}

export function DeleteModal({
  thoughtId,
  isOpen,
  onClose,
  onDeleted,
}: DeleteModalProps) {
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please enter your secret deletion key.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/thoughts/${thoughtId}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletionToken: token.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete thought.");
      }

      setSuccess(true);
      setTimeout(() => {
        onDeleted(thoughtId);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Invalid deletion key. Please double-check the key you saved.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
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

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-sage-muted text-sage flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-medium text-text-primary">
              Thought Permanently Removed
            </h3>
            <p className="text-sm text-text-secondary">
              Your words have been erased from the public sanctuary.
            </p>
          </div>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4">
            <div className="flex items-center gap-2.5 text-terracotta">
              <KeyRound className="w-5 h-5" />
              <h2 id="delete-modal-title" className="font-serif text-xl font-medium text-text-primary">
                Remove Your Thought
              </h2>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              To delete this thought without an account, paste the unique secret deletion key provided to you when you published it.
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Secret Deletion Key
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. unspoken-del-..."
                className="w-full rounded-lg bg-input-bg border border-border-subtle p-3 text-sm text-text-primary font-mono placeholder:font-sans placeholder:text-text-muted focus:outline-none focus:border-terracotta"
                autoFocus
              />
              <p className="text-xs text-text-muted">
                This key was shown to you once after publishing.
              </p>
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-700/80 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
