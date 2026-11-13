"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { ShieldCheck, HeartHandshake, EyeOff } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-bg-surface/50 text-text-secondary transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand & Philosophy Column */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="font-serif text-xl italic text-text-primary">
              &ldquo;Even silence deserves to be heard.&rdquo;
            </p>
            <p className="text-sm text-text-secondary max-w-md leading-relaxed">
              UnSpoken is a quiet digital haven for thoughts, struggles, and reflections left
              unshared. No profiles, no public identities, and no judgment.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-sage" /> Total Anonymity
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-terracotta" /> Compassionate Space
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sage" /> Zero Ads &amp; Tracking
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-text-primary">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  Explore Thoughts
                </Link>
              </li>
              <li>
                <Link
                  href="/write"
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  Share Anonymously
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  Our Philosophy
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-text-primary">
              Safety &amp; Ethics
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/safety"
                  className="hover:text-text-primary transition-colors duration-150 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sage"></span>
                  Safety &amp; Support Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-text-primary transition-colors duration-150"
                >
                  Privacy &amp; Data Ethics
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-text-muted hover:text-text-secondary transition-colors duration-150 text-xs"
                >
                  Moderation Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>
            © 2026 UnSpoken. A place for everything left unsaid.
          </p>
          <p className="text-center sm:text-right">
            If you are in immediate crisis, please call Tele-MANAS at{" "}
            <a
              href="tel:14416"
              className="text-terracotta hover:underline font-medium"
            >
              14416
            </a>{" "}
            or emergency at{" "}
            <a
              href="tel:112"
              className="text-terracotta hover:underline font-medium"
            >
              112
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
