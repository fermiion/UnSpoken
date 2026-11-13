import React from "react";
import Link from "next/link";
import { HeartHandshake, PhoneCall, ExternalLink } from "lucide-react";

interface CrisisSupportBannerProps {
  message?: string;
  className?: string;
}

export function CrisisSupportBanner({
  message = "We hear what you are carrying, and you do not have to carry it alone.",
  className = "",
}: CrisisSupportBannerProps) {
  return (
    <div
      role="region"
      aria-label="Crisis Support Resources"
      className={`rounded-xl border border-terracotta/30 bg-terracotta-muted/50 p-4 sm:p-5 text-text-primary transition-all duration-200 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-terracotta/15 text-terracotta shrink-0 mt-0.5">
          <HeartHandshake className="w-5 h-5" />
        </div>

        <div className="space-y-2 text-sm flex-1">
          <div className="font-medium text-text-primary text-base font-serif">
            You are not alone in this moment.
          </div>
          <p className="text-text-secondary leading-relaxed text-sm">
            {message} If you are experiencing overwhelming emotional pain or considering
            self-harm, please connect with gentle, confidential support right now.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="tel:14416"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Tele-MANAS: 14416 (India 24/7)</span>
            </a>

            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-surface border border-border-subtle hover:border-terracotta text-text-primary transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-terracotta" />
              <span>Emergency: 112</span>
            </a>

            <Link
              href="/safety"
              className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline font-medium ml-auto"
            >
              <span>View all global support contacts</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
