"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WritingEditor } from "@/components/thoughts/WritingEditor";
import { ThoughtCard } from "@/components/thoughts/ThoughtCard";
import { PublicThought } from "@/lib/services/thoughtService";
import { CrisisSupportBanner } from "@/components/common/CrisisSupportBanner";
import {
  Shield,
  Feather,
  Compass,
  Heart,
  EyeOff,
  Sparkles,
  ArrowRight,
  Lock,
  MessageSquareOff,
} from "lucide-react";

export default function HomePage() {
  const [recentThoughts, setRecentThoughts] = useState<PublicThought[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentThoughts = async () => {
    try {
      const res = await fetch("/api/thoughts?limit=4");
      if (res.ok) {
        const data = await res.json();
        setRecentThoughts(data.thoughts || []);
      }
    } catch (err) {
      console.error("Failed to fetch recent thoughts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentThoughts();
  }, []);

  const handleDeletedThought = (id: string) => {
    setRecentThoughts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 sm:py-24 md:py-28 px-4 sm:px-6 border-b border-border-subtle/60">
          {/* Subtle background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-terracotta/5 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            {/* Privacy indicator pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bg-surface border border-border-subtle text-xs text-text-secondary">
              <EyeOff className="w-3.5 h-3.5 text-sage" />
              <span>Your identity stays hidden from other visitors.</span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-text-primary leading-[1.12]">
              Some thoughts are too heavy to carry alone.
            </h1>

            {/* Supporting Text */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary font-light leading-relaxed">
              You don&apos;t have to explain everything. Just start writing. Nobody needs to
              know who you are.
            </p>

            {/* Hero CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#writing-area"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-medium bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-all duration-150 shadow-md active:scale-[0.99]"
              >
                <Feather className="w-4 h-4" />
                <span>Let it out</span>
              </a>

              <Link
                href="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-medium bg-bg-surface border border-border-subtle hover:border-border-strong text-text-primary transition-all duration-150"
              >
                <Compass className="w-4 h-4 text-terracotta" />
                <span>Read others&apos; stories</span>
              </Link>
            </div>
          </div>
        </section>

        {/* WRITING PREVIEW SECTION */}
        <section id="writing-area" className="py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <WritingEditor
              onSuccess={fetchRecentThoughts}
              className="border-terracotta/25"
            />
          </div>
        </section>

        {/* RECENT THOUGHTS SECTION: "Words left behind." */}
        <section className="py-16 px-4 sm:px-6 border-t border-border-subtle bg-bg-surface/30">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                  Recent Submissions
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary mt-1">
                  Words left behind.
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Stories from people you might never meet.
                </p>
              </div>

              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:underline group"
              >
                <span>Explore all reflections</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Thoughts List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-bg-surface/60 border border-border-subtle animate-pulse"
                  />
                ))}
              </div>
            ) : recentThoughts.length > 0 ? (
              <div className="space-y-5">
                {recentThoughts.map((thought) => (
                  <ThoughtCard
                    key={thought.id}
                    thought={thought}
                    onDeleted={handleDeletedThought}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-bg-surface border border-border-subtle p-8">
                <Sparkles className="w-8 h-8 text-terracotta mx-auto mb-3 opacity-60" />
                <p className="font-serif text-xl text-text-primary">Silence rests here.</p>
                <p className="text-sm text-text-secondary mt-1">
                  Be the first to share a quiet reflection.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* HOW UNSPOKEN WORKS */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border-subtle">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sage">
                Gentle Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary">
                A sanctuary designed for listening.
              </h2>
              <p className="text-sm text-text-secondary max-w-xl mx-auto">
                No algorithms fighting for your attention. No follower counters. Just human
                moments shared in safe quietness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Pillar 1 */}
              <div className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-muted text-terracotta flex items-center justify-center">
                  <EyeOff className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">
                  1. Zero Exposure
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  No accounts, no email, no public profile. You publish purely anonymously.
                  Only you receive a private cryptographic key if you ever wish to delete your post.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sage-muted text-sage flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">
                  2. Quiet Kindness
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Support is conveyed through four gentle affirmations: &ldquo;I hear you&rdquo;,
                  &ldquo;You&apos;re not alone&rdquo;, &ldquo;Sending warmth&rdquo;, and &ldquo;I understand&rdquo;. No debate or unsolicited advice.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-muted text-terracotta flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">
                  3. Safe Harbour
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Harmful encouragement and threats are screened immediately. Distress is met
                  with compassionate crisis resources rather than automatic punitive bans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXPRESSION WITHOUT EXPOSURE */}
        <section className="py-16 px-4 sm:px-6 border-t border-border-subtle bg-bg-surface/20">
          <div className="max-w-4xl mx-auto rounded-3xl bg-bg-surface border border-border-strong p-8 sm:p-12 space-y-6">
            <div className="flex items-center gap-3 text-terracotta">
              <Lock className="w-6 h-6" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Our Foundational Principle
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal leading-tight">
              Expression without judgment. Connection without exposure.
            </h2>

            <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
              Most of the internet forces you to build an identity, cultivate a brand, and
              defend your vulnerabilities. UnSpoken is the antithesis of that noise. Here, you
              can lay your burdens down, knowing strangers will read with quiet empathy, and
              move on without demanding anything in return.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MessageSquareOff className="w-4 h-4 text-terracotta" /> No Public Comment Arguments
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sage" /> No Tracking Or Retargeting
              </span>
              <span className="inline-flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-terracotta" /> No Email Required
              </span>
            </div>
          </div>
        </section>

        {/* SAFETY & CRISIS QUICK BANNER */}
        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <CrisisSupportBanner />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
