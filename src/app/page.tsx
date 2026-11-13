"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WritingEditor } from "@/components/thoughts/WritingEditor";
import { ThoughtCard } from "@/components/thoughts/ThoughtCard";
import { PublicThought } from "@/lib/services/thoughtService";
import {
  Shield,
  Feather,
  Compass,
  Heart,
  EyeOff,
  Sparkles,
  ArrowRight,
  PhoneCall,
  ExternalLink,
  HeartHandshake,
  Lock,
  MessageSquareOff,
  CheckCircle,
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
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 border-b border-border-subtle/70">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[340px] bg-terracotta/6 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="w-full max-w-[60rem] mx-auto text-center space-y-7 relative z-10">
            {/* Privacy indicator badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bg-surface border border-border-subtle text-xs text-text-secondary shadow-xs">
              <EyeOff className="w-3.5 h-3.5 text-sage" />
              <span>Your identity stays hidden from other visitors.</span>
            </div>

            {/* Main Heading in Lora serif */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-text-primary leading-[1.14] max-w-4xl mx-auto">
              Some thoughts are too heavy to carry alone.
            </h1>

            {/* Supporting Text in DM Sans */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary font-normal leading-relaxed">
              You don&apos;t have to explain everything. Just start writing. Nobody needs to
              know who you are.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href="#writing-area"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-semibold tracking-wide bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-all duration-150 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Feather className="w-4 h-4" />
                <span>Let it out</span>
              </a>

              <Link
                href="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold tracking-wide bg-bg-surface border border-border-subtle hover:border-border-strong text-text-primary transition-all duration-150 shadow-xs cursor-pointer"
              >
                <Compass className="w-4 h-4 text-terracotta" />
                <span>Read others&apos; stories</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. WRITING SECTION */}
        <section id="writing-area" className="py-14 sm:py-20 px-4 sm:px-6">
          <div className="w-full max-w-[60rem] mx-auto">
            <WritingEditor
              onSuccess={fetchRecentThoughts}
              className="border-border-subtle"
            />
          </div>
        </section>

        {/* 3. RECENT SUBMISSIONS SECTION */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border-subtle bg-bg-surface/20">
          <div className="w-full max-w-[60rem] mx-auto space-y-8">
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
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:underline group self-start sm:self-auto cursor-pointer"
              >
                <span>Explore all reflections</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Responsive Card Grid */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-bg-surface/50 border border-border-subtle animate-pulse"
                  />
                ))}
              </div>
            ) : recentThoughts.length > 0 ? (
              <div className="space-y-6">
                {recentThoughts.map((thought) => (
                  <ThoughtCard
                    key={thought.id}
                    thought={thought}
                    onDeleted={handleDeletedThought}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 rounded-2xl bg-bg-surface border border-border-subtle p-8 space-y-3">
                <Sparkles className="w-8 h-8 text-terracotta mx-auto opacity-70" />
                <h3 className="font-serif text-xl font-medium text-text-primary">
                  Silence rests here.
                </h3>
                <p className="text-sm text-text-secondary max-w-sm mx-auto">
                  Be the first to share a quiet reflection.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 4. OUR PHILOSOPHY SECTION */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border-subtle">
          <div className="w-full max-w-[60rem] mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sage">
                Our Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-text-primary">
                A sanctuary designed for listening.
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
                No algorithms fighting for your attention. No follower counters. Just human
                moments shared in quiet safety.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {/* Feature Card 1: Zero Exposure */}
              <div className="rounded-2xl bg-bg-surface border border-border-subtle hover:border-border-strong p-7 space-y-3.5 shadow-xs transition-colors flex flex-col h-full">
                <div className="w-11 h-11 rounded-xl bg-terracotta-muted text-terracotta flex items-center justify-center shrink-0">
                  <EyeOff className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">
                  Zero Exposure
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light flex-1">
                  No accounts, no email, no public profile. You publish purely anonymously.
                  Only you receive a private cryptographic key if you ever wish to delete your post.
                </p>
              </div>

              {/* Feature Card 2: Quiet Kindness */}
              <div className="rounded-2xl bg-bg-surface border border-border-subtle hover:border-border-strong p-7 space-y-3.5 shadow-xs transition-colors flex flex-col h-full">
                <div className="w-11 h-11 rounded-xl bg-sage-muted text-sage flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">
                  Quiet Kindness
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light flex-1">
                  Support is conveyed through four gentle affirmations: &ldquo;I hear you&rdquo;,
                  &ldquo;You&apos;re not alone&rdquo;, &ldquo;Sending warmth&rdquo;, and &ldquo;I understand&rdquo;. No debates or unwanted advice.
                </p>
              </div>

              {/* Feature Card 3: Safe Harbour */}
              <div className="rounded-2xl bg-bg-surface border border-border-subtle hover:border-border-strong p-7 space-y-3.5 shadow-xs transition-colors flex flex-col h-full">
                <div className="w-11 h-11 rounded-xl bg-terracotta-muted text-terracotta flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">
                  Safe Harbour
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light flex-1">
                  Harmful encouragement and threats are screened immediately. Distress is met
                  with compassionate crisis resources rather than automatic punitive bans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. OUR FOUNDATIONAL PRINCIPLE */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border-subtle bg-bg-surface/20">
          <div className="w-full max-w-[60rem] mx-auto rounded-3xl bg-bg-surface border border-border-subtle p-8 sm:p-12 md:p-14 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 text-terracotta">
              <div className="w-9 h-9 rounded-xl bg-terracotta-muted flex items-center justify-center text-terracotta shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">
                Our Foundational Principle
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-text-primary font-normal leading-[1.18]">
              Expression without judgement. Connection without exposure.
            </h2>

            <p className="text-text-secondary text-base sm:text-lg leading-relaxed font-light max-w-3xl">
              Most of the internet forces you to build an identity, cultivate a brand, and
              defend your vulnerabilities. UnSpoken is the antithesis of that noise. Here, you
              can lay your burdens down, knowing strangers will read with quiet empathy, and
              move on without demanding anything in return.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MessageSquareOff className="w-4 h-4 text-terracotta" /> No Public Comment Arguments
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sage" /> No Tracking Or Retargeting
              </span>
              <span className="inline-flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-terracotta" /> No Registration Required
              </span>
            </div>
          </div>
        </section>

        {/* 6. A LITTLE WARMTH FOR YOU (Personal Letter) */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border-subtle bg-bg-surface/20">
          <div className="w-full max-w-[60rem] mx-auto">
            <article
              aria-label="A Little Warmth for You"
              className="rounded-3xl bg-bg-surface border border-border-subtle p-8 sm:p-12 md:p-14 space-y-8 shadow-sm"
            >
              {/* Card Header / Label & Signature */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-terracotta-muted flex items-center justify-center text-terracotta shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-terracotta block">
                      A Little Warmth for You
                    </span>
                    <span className="text-xs text-text-muted">
                      A quiet letter for the silent hearts
                    </span>
                  </div>
                </div>
                <span className="text-xs font-serif italic text-text-muted select-none self-start sm:self-auto">
                  UnSpoken Sanctuary
                </span>
              </div>

              {/* Main Reading Column - comfortable reading width */}
              <div className="max-w-3xl space-y-6">
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-text-primary font-normal leading-[1.18]">
                  To the ones who feel everything, but say so little.
                </h2>

                <div className="font-serif text-text-secondary text-base sm:text-lg leading-relaxed font-light space-y-5">
                  <p>
                    To the ones who walk softly into rooms, carrying galaxies of emotion behind a steady smile.
                    To the ones who listen endlessly to everyone else&apos;s grief, but swallow their own when asked how they are doing.
                  </p>

                  <p>
                    You spend so much time making sure everyone else has a soft place to land. You notice the shifts in other people&apos;s voices, the hesitation in their eyes, the unspoken sorrows they try so hard to hide. You give your grace away freely, yet you rarely save any for yourself.
                  </p>

                  <p>
                    We want you to know: you do not have to be the strong one here. You do not have to hold up the sky all by yourself, and your pain is never an inconvenience or a burden to this space. It is okay if today was heavy. It is okay if you don&apos;t have the answers, or the energy to explain why your heart feels tired.
                  </p>

                  <p>
                    Whatever you are holding, whatever you cannot say out loud to the world outside—you don&apos;t have to keep it locked away inside your chest.
                  </p>

                  <p className="text-text-primary font-normal italic">
                    Even when the world feels too loud and your voice feels too quiet, your presence matters deeply. You are seen, you are heard, and you are never as alone as the silence makes you feel.
                  </p>
                </div>
              </div>

              {/* Card Footer / Sign-off */}
              <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-serif italic text-xs sm:text-sm text-text-muted">
                    With quiet warmth and gentle care,
                  </p>
                  <p className="font-serif text-base sm:text-lg font-medium text-terracotta">
                    UnSpoken
                  </p>
                </div>
                <p className="text-xs text-text-muted font-sans font-light">
                  A place for everything left unsaid.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* 7. SAFETY AND SUPPORT SECTION */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border-subtle">
          <div className="w-full max-w-[60rem] mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-muted text-sage text-xs font-semibold uppercase tracking-wider">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Support Resources</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary">
                You are not alone in this moment.
              </h2>

              <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
                UnSpoken is a quiet listening room for peer expression, not a clinical healthcare
                provider or emergency service. If you are experiencing overwhelming emotional pain
                or a crisis, professional human help is available right now.
              </p>
            </div>

            {/* Emergency & Support Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Tele-MANAS */}
              <div className="rounded-2xl bg-bg-surface border border-border-subtle hover:border-border-strong p-7 space-y-4 flex flex-col justify-between shadow-xs transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-medium text-text-primary">
                      Tele-MANAS (India)
                    </h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sage-muted text-sage font-medium">
                      24/7 Toll-Free
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed font-light">
                    National mental health assistance by the Government of India. Free and available in multiple regional languages.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="tel:14416"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call 14416</span>
                  </a>
                  <span className="text-xs text-text-muted">or 1800-891-4416</span>
                </div>
              </div>

              {/* National Emergency */}
              <div className="rounded-2xl bg-bg-surface border border-border-subtle hover:border-border-strong p-7 space-y-4 flex flex-col justify-between shadow-xs transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-medium text-text-primary">
                      National Emergency
                    </h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">
                      Immediate Crisis
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed font-light">
                    Unified emergency helpline for immediate medical, police, and life safety emergencies.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-bg-elevated border border-border-subtle hover:border-terracotta text-text-primary transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-terracotta" />
                    <span>Call 112</span>
                  </a>

                  <Link
                    href="/safety"
                    className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline font-medium cursor-pointer"
                  >
                    <span>View all helplines</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
