import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Check, X, AlertTriangle, Heart } from "lucide-react";
import Link from "next/link";

export default function GuidelinesPage() {
  const allowed = [
    "Raw, genuine emotional expressions of sadness, grief, confusion, or doubt.",
    "Reflections on relationships, breakups, estrangements, and unspoken gratitude.",
    "Personal struggles with mental health and seeking empathy without fear of judgment.",
    "Hopes, private confessions, dreams you haven't dared to say out loud.",
    "Supportive, gentle reactions to strangers' stories.",
  ];

  const prohibited = [
    "Targeted harassment, bullying, or directing hostility toward specific people.",
    "Posting names, phone numbers, addresses, social profiles, or identifying details (Doxxing).",
    "Direct threats of violence or danger toward any person or group.",
    "Encouraging, instructing, or glorifying self-harm or suicide.",
    "Promotional content, commercial spam, phishing links, or repetitive automated bots.",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sage-muted/50 border border-sage/20 text-xs font-semibold uppercase tracking-wider text-sage">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sanctuary Boundaries</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-text-primary">
            Community Guidelines
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto font-light leading-relaxed">
            UnSpoken exists to preserve a quiet, tender space. To protect that sanctuary, we ask
            everyone who steps inside to honour these principles.
          </p>
        </div>

        {/* Philosophy of Moderation */}
        <div className="rounded-2xl bg-bg-surface border border-border-subtle p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-terracotta text-sm font-semibold uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            <span>Our Approach to Moderation</span>
          </div>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            We recognize the profound difference between someone expressing their suffering and
            someone inflicting harm on others. A person weeping or speaking of despair is not
            violating our guidelines — they are being human. We screen strictly against malice,
            harassment, and incitement of harm, while providing compassionate support resources
            when crisis is voiced.
          </p>
        </div>

        {/* Two Columns: Welcomed vs Forbidden */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Welcomed */}
          <div className="rounded-2xl bg-bg-surface border border-sage/30 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-sage font-medium text-lg font-serif">
              <Check className="w-5 h-5" />
              <span>What is welcomed here</span>
            </div>
            <ul className="space-y-3">
              {allowed.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prohibited */}
          <div className="rounded-2xl bg-bg-surface border border-red-500/20 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-medium text-lg font-serif">
              <X className="w-5 h-5" />
              <span>What is not allowed</span>
            </div>
            <ul className="space-y-3">
              {prohibited.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reporting and Safety */}
        <div className="rounded-2xl bg-bg-elevated border border-border-strong p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif text-xl font-medium text-text-primary">
              Notice something harmful?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md">
              Every thought card has a discreet reporting option. Reports are handled with
              complete confidentiality.
            </p>
          </div>

          <Link
            href="/safety"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors shrink-0"
          >
            Safety &amp; Support Resources
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
