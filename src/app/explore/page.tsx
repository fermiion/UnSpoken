"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThoughtCard } from "@/components/thoughts/ThoughtCard";
import { PublicThought } from "@/lib/services/thoughtService";
import {
  Compass,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Reflections" },
  { id: "unspoken", label: "Unspoken Thoughts" },
  { id: "loneliness", label: "Loneliness" },
  { id: "relationships", label: "Relationships" },
  { id: "life", label: "Life" },
  { id: "personal-growth", label: "Personal Growth" },
  { id: "things-left-unsaid", label: "Things Left Unsaid" },
  { id: "hope", label: "Hope" },
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [thoughts, setThoughts] = useState<PublicThought[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThoughts = useCallback(
    async (targetPage = 1, category = selectedCategory, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const query = new URLSearchParams({
          page: targetPage.toString(),
          limit: "8",
          category,
        });

        const res = await fetch(`/api/thoughts?${query.toString()}`);
        if (!res.ok) {
          throw new Error("Unable to load thoughts at this time.");
        }

        const data = await res.json();
        const newThoughts = data.thoughts || [];

        if (append) {
          setThoughts((prev) => [...prev, ...newThoughts]);
        } else {
          setThoughts(newThoughts);
        }

        setHasMore(Boolean(data.hasMore));
        setPage(targetPage);
      } catch (err: any) {
        setError(err.message || "Failed to load reflections.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    fetchThoughts(1, selectedCategory, false);
  }, [selectedCategory, fetchThoughts]);

  const handleCategoryChange = (catId: string) => {
    if (catId === selectedCategory) return;
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleDeletedThought = (id: string) => {
    setThoughts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-muted/50 border border-terracotta/20 text-xs font-semibold uppercase tracking-wider text-terracotta">
            <Compass className="w-3.5 h-3.5" />
            <span>The Silent River</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-text-primary">
            Explore Anonymous Thoughts
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto font-light leading-relaxed">
            Read without expectation. No algorithm ranks these words by popularity. Each
            reflection represents a human being finding peace.
          </p>
        </div>

        {/* Filter Category Chips */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted px-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Browse by theme</span>
          </div>

          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
            role="tablist"
            aria-label="Filter reflections by theme"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 border ${
                    isSelected
                      ? "bg-terracotta text-bg-primary border-terracotta shadow-sm font-semibold"
                      : "bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchThoughts(1, selectedCategory, false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface text-xs font-medium hover:bg-bg-elevated transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Feed List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-bg-surface/50 border border-border-subtle animate-pulse"
              />
            ))}
          </div>
        ) : thoughts.length > 0 ? (
          <div className="space-y-5">
            {thoughts.map((thought) => (
              <ThoughtCard
                key={thought.id}
                thought={thought}
                onDeleted={handleDeletedThought}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => fetchThoughts(page + 1, selectedCategory, true)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-bg-surface border border-border-subtle hover:border-border-strong text-text-primary transition-all duration-150 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
                      <span>Loading more reflections...</span>
                    </>
                  ) : (
                    <span>Load more thoughts</span>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-bg-surface border border-border-subtle p-8 space-y-3">
            <Sparkles className="w-10 h-10 text-terracotta mx-auto opacity-70" />
            <h2 className="font-serif text-2xl font-medium text-text-primary">
              No thoughts found in this theme.
            </h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Perhaps this silence is waiting for your words.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
