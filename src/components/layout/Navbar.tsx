"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Logo } from "@/components/common/Logo";
import { Sun, Moon, Feather, Menu, X, Shield, Compass, BookOpen, Home } from "lucide-react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "About", href: "/about", icon: BookOpen },
    { label: "Safety & Support", href: "/safety", icon: Shield },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-bg-primary/90 border-b border-border-subtle transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Logo size="md" />
        </div>

        {/* Centre: Main Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-surface/60 border border-border-subtle shadow-xs"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  active
                    ? "text-terracotta bg-terracotta-muted font-semibold shadow-xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Switcher & Write Button */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary bg-bg-surface hover:bg-bg-elevated border border-border-subtle transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta cursor-pointer"
            aria-label={
              theme === "dark"
                ? "Switch to Light Mode (Earth & Light)"
                : "Switch to Dark Mode (Midnight Warmth)"
            }
            title={
              theme === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-terracotta transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-terracotta transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Prominent Write a Thought Button */}
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-terracotta text-bg-primary hover:bg-terracotta-hover shadow-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.98]"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Write a Thought</span>
          </Link>
        </div>

        {/* Mobile: Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary bg-bg-surface border border-border-subtle cursor-pointer"
            aria-label="Toggle visual theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-terracotta" />
            ) : (
              <Moon className="w-4 h-4 text-terracotta" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary bg-bg-surface border border-border-subtle cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-subtle bg-bg-surface/95 backdrop-blur-md px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-colors ${
                    active
                      ? "text-terracotta bg-terracotta-muted font-semibold"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  }`}
                >
                  <Icon className="w-4 h-4 text-terracotta" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-border-subtle">
            <Link
              href="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors"
            >
              <Feather className="w-4 h-4" />
              <span>Write a Thought</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
