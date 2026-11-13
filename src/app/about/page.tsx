import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import {
  Heart,
  EyeOff,
  ShieldCheck,
  Feather,
  Sparkles,
  ArrowRight,
  HandHeart,
  Lock,
} from "lucide-react";

export default function AboutPage() {
  const principles = [
    {
      title: "Expression without judgement",
      description:
        "Every human carries thoughts they cannot safely articulate in daily life. Here, you can speak your truth without fear of criticism or shame.",
    },
    {
      title: "Connection without exposure",
      description:
        "You do not need to expose your name, face, or credentials to know you are understood. Strangers can connect through shared humanity without knowing each other's identities.",
    },
    {
      title: "Privacy without mandatory registration",
      description:
        "We believe privacy is an absolute human right, not a setting hidden behind account creation. We never ask for your email, phone number, or personal information.",
    },
    {
      title: "Empathy without expectations",
      description:
        "Supportive affirmations require nothing in return. There are no debt-like social obligations, no follow-backs, and no conversational upkeep.",
    },
    {
      title: "Safety without suppressing genuine emotions",
      description:
        "Sadness, grief, loneliness, and confusion are not violations of terms of service. We protect against true malice while making room for genuine pain.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <Logo size="lg" className="mx-auto" />
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-text-primary tracking-tight">
            A place for everything left unsaid.
          </h1>
          <p className="font-serif italic text-xl sm:text-2xl text-terracotta">
            &ldquo;Even silence deserves to be heard.&rdquo;
          </p>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto font-light leading-relaxed">
            UnSpoken was conceived as a digital sanctuary: a quiet room where the heavy,
            complicated, and unshared corners of human life can be laid down safely.
          </p>
        </div>

        {/* Why UnSpoken Exists */}
        <section className="rounded-3xl bg-bg-surface border border-border-subtle p-8 sm:p-12 space-y-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-sage">
            The Purpose
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-text-primary font-normal">
            Why we do not resemble social media.
          </h2>
          <div className="space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed font-light">
            <p>
              Contemporary digital platforms are built around engagement metrics, performative
              identities, and algorithmic amplification. Every vulnerability shared in public
              risk being dissected, questioned, or weaponized.
            </p>
            <p>
              On the other end, clinical applications often treat human emotional weight as
              symptoms to be triaged rather than feelings to be felt.
            </p>
            <p>
              UnSpoken occupies the quiet ground between both worlds. It is neither a popularity
              contest nor a medical facility. It is simply a communal listening room where
              someone in one corner of the world can read what someone in another corner wrote at
              3:00 AM and softly think: <em>&ldquo;I understand. You are not alone.&rdquo;</em>
            </p>
          </div>
        </section>

        {/* Five Core Pillars */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
              Guiding Ethos
            </span>
            <h2 className="font-serif text-3xl font-normal text-text-primary">
              The Five Principles of UnSpoken
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((p, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta">
                  <span>0{idx + 1}.</span>
                  <span>Principle</span>
                </div>
                <h3 className="font-serif text-xl font-medium text-text-primary">
                  {p.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-light">
                  {p.description}
                </p>
              </div>
            ))}

            <div className="rounded-2xl bg-bg-elevated border border-border-strong p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sage">
                  Ready to share?
                </span>
                <h3 className="font-serif text-2xl font-medium text-text-primary">
                  You don&apos;t have to hold it all inside.
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Start writing without creating an account or providing an email address.
                </p>
              </div>

              <Link
                href="/write"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors"
              >
                <span>Write your thought</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
