import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  PhoneCall,
  Shield,
  HeartHandshake,
  AlertCircle,
  ExternalLink,
  LifeBuoy,
  Globe,
} from "lucide-react";

export default function SafetyPage() {
  const indiaHelplines = [
    {
      name: "Tele-MANAS (Govt. of India)",
      number: "14416",
      altNumber: "1800-891-4416",
      timing: "24/7, Free & Multi-lingual",
      desc: "Comprehensive, national mental health helpline by the Ministry of Health and Family Welfare.",
      href: "tel:14416",
    },
    {
      name: "National Emergency Services",
      number: "112",
      timing: "24/7 Immediate Emergency",
      desc: "Unified emergency number across India for ambulance, police, and life-threatening crises.",
      href: "tel:112",
    },
    {
      name: "Vandrevala Foundation",
      number: "+91 9999 666 555",
      timing: "24/7 Free & Confidential",
      desc: "Free professional mental health counseling and crisis intervention.",
      href: "tel:+919999666555",
    },
    {
      name: "KIRAN Helpline",
      number: "1800-599-0019",
      timing: "24/7 Toll-Free (13 Languages)",
      desc: "Mental health rehabilitation helpline provided by the Department of Empowerment of Persons with Disabilities.",
      href: "tel:18005990019",
    },
  ];

  const internationalHelplines = [
    {
      country: "United States & Canada",
      service: "988 Suicide & Crisis Lifeline",
      contact: "Dial or Text 988",
      href: "tel:988",
    },
    {
      country: "United Kingdom",
      service: "Samaritans & NHS 111",
      contact: "Call 116 123 or 111",
      href: "tel:116123",
    },
    {
      country: "Australia",
      service: "Lifeline Australia",
      contact: "Call 13 11 14",
      href: "tel:131114",
    },
    {
      country: "Global & Other Countries",
      service: "Befrienders Worldwide",
      contact: "Find local confidential support in 30+ countries",
      href: "https://www.befrienders.org/",
      isExternal: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-14">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-terracotta-muted/50 border border-terracotta/20 text-xs font-semibold uppercase tracking-wider text-terracotta">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Crisis &amp; Care</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-text-primary">
            Safety and Support Resources
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto font-light leading-relaxed">
            If you or someone you know is in immediate danger or severe emotional distress,
            please know that professional, caring human beings are ready to listen right now.
          </p>
        </div>

        {/* Clear Scope Disclaimer */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-6 sm:p-7 text-text-primary space-y-3">
          <div className="flex items-center gap-2 text-amber-500 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h2 className="font-serif text-lg">Important Notice: What UnSpoken Is and Is Not</h2>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            UnSpoken is a quiet peer-expression platform for anonymous thoughts.{" "}
            <strong>It is not a crisis center, healthcare provider, or therapy substitute.</strong>{" "}
            We cannot provide real-time clinical monitoring, emergency intervention, or guarantee
            that every distress signal will be caught automatically. If you are struggling, please
            reach out to the verified hotlines below.
          </p>
        </div>

        {/* Indian Helplines */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
              Immediate Care — India
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-1">
              Verified Emergency &amp; Mental Health Helplines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {indiaHelplines.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-bg-surface border border-border-subtle p-6 flex flex-col justify-between space-y-4 hover:border-border-strong transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium text-text-primary">
                      {item.name}
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-sage-muted text-sage font-medium">
                      {item.timing}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-terracotta text-bg-primary hover:bg-terracotta-hover transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call {item.number}</span>
                  </a>
                  {item.altNumber && (
                    <span className="text-xs text-text-muted ml-3">
                      or {item.altNumber}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* International Helplines */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sage" />
            <h2 className="font-serif text-2xl sm:text-3xl text-text-primary">
              Global Support Lines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {internationalHelplines.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                className="group rounded-2xl bg-bg-surface border border-border-subtle p-5 flex items-center justify-between hover:border-terracotta transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {item.country}
                  </span>
                  <div className="text-sm font-medium text-text-primary">
                    {item.service}
                  </div>
                  <div className="text-xs text-terracotta">{item.contact}</div>
                </div>

                {item.isExternal ? (
                  <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-terracotta transition-colors" />
                ) : (
                  <PhoneCall className="w-4 h-4 text-text-muted group-hover:text-terracotta transition-colors" />
                )}
              </a>
            ))}
          </div>
        </section>

        {/* How Anonymity and Safety Work Together */}
        <section className="rounded-3xl bg-bg-surface border border-border-subtle p-8 sm:p-10 space-y-4">
          <h2 className="font-serif text-2xl text-text-primary font-medium">
            How we maintain safety without surveillance
          </h2>
          <div className="space-y-3 text-sm text-text-secondary leading-relaxed font-light">
            <p>
              We believe a person in pain should never feel that seeking peer comfort will trigger
              punitive bans or public embarrassment.
            </p>
            <p>
              When our screening detects signs of personal emotional distress, we do not silence
              the submission. Instead, we preserve your expression while gently offering crisis
              helpline options. Only content that threatens harm to others, instructs self-harm,
              harasses, or violates community safety is held or removed by our moderation team.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
