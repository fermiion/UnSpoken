import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  size = "md",
  showWordmark = true,
  className = "",
  href = "/",
}: LogoProps) {
  const iconDimensions = {
    sm: { w: 22, h: 22, stroke: 1.8, r: 2.2 },
    md: { w: 28, h: 28, stroke: 2, r: 2.8 },
    lg: { w: 38, h: 38, stroke: 2.2, r: 3.8 },
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Abstract Open Circle with Central Gentle Light */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105 shrink-0"
        aria-hidden="true"
      >
        <defs>
          <radialGradient
            id="logoCenterGlow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="var(--terracotta)" stopOpacity="1" />
            <stop offset="60%" stopColor="var(--terracotta)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--terracotta)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Listening Arc / Safe Haven */}
        <path
          d="M 18 4 A 14 14 0 1 1 5.5 22.5"
          stroke="var(--terracotta)"
          strokeWidth={iconDimensions.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-300"
        />

        {/* Soft Inner Ripple */}
        <path
          d="M 18 9 A 9 9 0 0 1 26 21"
          stroke="var(--sage)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* Gentle Ambient Radiance */}
        <circle cx="18" cy="18" r="8" fill="url(#logoCenterGlow)" opacity="0.3" />

        {/* Central Light emerging from silence */}
        <circle
          cx="18"
          cy="18"
          r={iconDimensions.r}
          fill="var(--terracotta)"
          className="animate-pulse"
          style={{ animationDuration: "3.5s" }}
        />
      </svg>

      {showWordmark && (
        <span
          className={`font-brand tracking-tight font-medium text-text-primary ${textSize} transition-colors duration-200`}
        >
          UnSpoken<span className="text-terracotta">.</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-lg inline-flex items-center"
        aria-label="UnSpoken - Return to home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
