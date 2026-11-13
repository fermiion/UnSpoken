"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WritingEditor } from "@/components/thoughts/WritingEditor";
import { CrisisSupportBanner } from "@/components/common/CrisisSupportBanner";
import { Feather, Shield, HeartHandshake, EyeOff, Lock } from "lucide-react";

export default function WritePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        {/* Editorial Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-terracotta-muted/50 border border-terracotta/20 text-xs font-semibold uppercase tracking-wider text-terracotta">
            <Feather className="w-3.5 h-3.5" />
            <span>Private Sanctuary</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-text-primary">
            You don&apos;t have to hold it all inside.
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto font-light leading-relaxed">
            There is no profile attached to your words. No one will know who you are. Speak
            freely, release what feels heavy, and let silence hold you.
          </p>
        </div>

        {/* Full Interactive Writing Editor */}
        <WritingEditor isStandalonePage={true} />

        {/* Three Guarantees of Privacy & Care */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-sage font-medium">
              <EyeOff className="w-4 h-4" />
              <span>Zero Registration</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              We never ask for your email, phone, name, or social logins.
            </p>
          </div>

          <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-terracotta font-medium">
              <Lock className="w-4 h-4" />
              <span>Deletion Key</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              You receive a secret cryptographic key to remove your thought anytime.
            </p>
          </div>

          <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-sage font-medium">
              <HeartHandshake className="w-4 h-4" />
              <span>No Judgment</span>
            </div>
            <p className="text-text-muted leading-relaxed">
              Only supportive reactions are allowed. No comments, no debates.
            </p>
          </div>
        </div>

        {/* Crisis Support Banner */}
        <div className="pt-4">
          <CrisisSupportBanner />
        </div>
      </main>

      <Footer />
    </div>
  );
}
