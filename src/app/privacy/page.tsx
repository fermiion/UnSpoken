import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EyeOff, KeyRound, ShieldAlert, Database, Lock, Server } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-terracotta-muted/50 border border-terracotta/20 text-xs font-semibold uppercase tracking-wider text-terracotta">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Ethics &amp; Transparency</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-text-primary">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto font-light leading-relaxed">
            Privacy is the foundation of UnSpoken. We do not monetize your emotions, harvest your
            identity, or build advertising dossiers on your vulnerabilities.
          </p>
        </div>

        {/* Core Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-3">
            <EyeOff className="w-6 h-6 text-terracotta" />
            <h3 className="font-serif text-lg font-medium text-text-primary">
              No Accounts or Profiles
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              We never collect your email address, phone number, real name, or profile photos. You
              can browse and submit completely anonymously.
            </p>
          </div>

          <div className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-3">
            <KeyRound className="w-6 h-6 text-sage" />
            <h3 className="font-serif text-lg font-medium text-text-primary">
              Cryptographic Deletion
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              When you submit a thought, your browser receives a random secret key. We only store its
              cryptographic one-way hash (SHA-256). You alone hold the key to delete it.
            </p>
          </div>

          <div className="rounded-2xl bg-bg-surface border border-border-subtle p-6 space-y-3">
            <Database className="w-6 h-6 text-terracotta" />
            <h3 className="font-serif text-lg font-medium text-text-primary">
              Zero Targeted Advertising
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              We never sell your written reflections, license data to third-party ad brokers, or use
              commercial behavioral tracking pixels.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="rounded-3xl bg-bg-surface border border-border-subtle p-8 sm:p-12 space-y-8 text-sm text-text-secondary leading-relaxed">
          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-text-primary font-medium">
              1. What Information Is Collected
            </h2>
            <p>
              When you submit a thought, we store the text content of your thought, the timestamp of
              submission, the broad category you chose, and the cryptographic hash of your deletion
              credential. We do not store cookies for tracking or user identification.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-text-primary font-medium">
              2. Technical Infrastructure &amp; Abuse Prevention
            </h2>
            <p>
              Anonymity to other visitors does not mean the underlying server infrastructure processes
              zero technical metadata. To protect against malicious bots, automated spam, and distributed
              denial-of-service attacks, incoming web requests process basic technical headers and IP
              addresses temporarily in volatile memory for rate-limiting. This metadata is not linked
              to your personal identity.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-text-primary font-medium">
              3. Right to Permanent Erasure
            </h2>
            <p>
              You maintain total control over your shared thoughts. Upon publication, you are given a
              unique deletion key (format: <code>unspoken-del-...</code>). At any time, you can visit
              your thought, choose &ldquo;I am the author (Delete)&rdquo;, provide this key, and the
              thought will be immediately and irreversibly purged from our database.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-text-primary font-medium">
              4. Data Retention &amp; Security
            </h2>
            <p>
              All traffic is encrypted in transit using industry-standard HTTPS / TLS. Database access
              is restricted with strict Row Level Security (RLS) policies. Deletion keys and moderation
              audit logs are never exposed through public queries.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
