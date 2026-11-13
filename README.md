# UnSpoken.
> **"A place for everything left unsaid."**  
> *You don't have to hold it all inside.*

UnSpoken is a production-minded, anonymous emotional expression platform where people can share thoughts, personal experiences, feelings, and struggles without revealing their identities or worrying about being judged.

---

## 🌟 Core Philosophy

- **Expression without judgement**: Speak what you cannot safely articulate in daily life.
- **Connection without exposure**: Read the experiences of strangers and connect without revealing your identity.
- **Privacy without mandatory registration**: No email, no phone number, no passwords, no public profile.
- **Empathy without expectations**: Supportive affirmations require nothing in return—no social debt, no follow-backs.
- **Safety without suppressing genuine emotions**: Sadness and distress are embraced with compassionate care; malice, harassment, and threats are blocked.

---

## 🎨 Theme System

UnSpoken features a complete dual theme system:

### 1. Dark Mode (Default) — *Midnight Warmth*
- **Main Background**: `#171615` (Midnight Charcoal)
- **Cards & Surfaces**: `#252321` (Warm Graphite)
- **Inputs & Elevated Surfaces**: `#302D2A` (Soft Mocha)
- **Buttons & Highlights**: `#B77D5F` (Muted Terracotta)
- **Main Headings & Text**: `#E9D9C9` (Warm Ivory)
- **Secondary Text**: `#B6A89A` (Warm Taupe)
- **Positive Indicators**: `#89917D` (Muted Sage)

### 2. Light Mode — *Earth & Light*
- **Main Background**: `#F7F1E8` (Warm Ivory)
- **Cards & Surfaces**: `#E9DDCC` (Soft Sand)
- **Buttons & Highlights**: `#B9785B` (Muted Terracotta)
- **Secondary Accent**: `#858D76` (Sage)
- **Primary Typography**: `#342B26` (Deep Espresso)
- **Secondary Typography**: `#746657` (Warm Taupe)

*Theme selection is persistent in `localStorage`, avoids initial page flickering via zero-latency pre-render scripts, and defaults strictly to Dark Mode.*

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **Typography**: Cormorant Garamond (brand wordmark), Lora (headings & thoughts), and DM Sans (body, navigation, buttons)
- **Icons**: Lucide React
- **Backend**: Next.js Server Route Handlers & cryptographic service layer
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) + automatic persistent fallback engine for out-of-the-box local development
- **Security**: Node.js Cryptography (SHA-256 content hashing, timing-safe deletion verification, HMAC admin sessions)

---

## 📁 Project Architecture

```
UnSpoken/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Homepage (Hero, Writing Preview, Recent Thoughts, Pillars)
│   │   ├── explore/page.tsx             # Calm Anonymous Feed (Theme filtering, pagination)
│   │   ├── write/page.tsx               # Dedicated Writing Sanctuary
│   │   ├── about/page.tsx               # Philosophy & Story
│   │   ├── guidelines/page.tsx          # Community Guidelines & Boundaries
│   │   ├── privacy/page.tsx             # Transparent Privacy & Data Ethics Policy
│   │   ├── safety/page.tsx              # Verified Crisis Helplines (Tele-MANAS, 112, 988, etc.)
│   │   ├── admin/page.tsx               # Protected Moderation Portal
│   │   ├── api/
│   │   │   ├── thoughts/route.ts        # GET feed & POST anonymous submission
│   │   │   ├── thoughts/[id]/react/route.ts
│   │   │   ├── thoughts/[id]/report/route.ts
│   │   │   ├── thoughts/[id]/delete/route.ts
│   │   │   └── admin/
│   │   │       ├── auth/route.ts        # Admin login & session verification
│   │   │       ├── stats/route.ts       # Platform metrics
│   │   │       ├── queue/route.ts       # Moderation & reports queue
│   │   │       └── moderate/route.ts    # Action execution
│   │   ├── layout.tsx                   # Root layout with fonts, theme script & meta
│   │   └── globals.css                  # Semantic color tokens and base styles
│   ├── components/
│   │   ├── common/Logo.tsx              # Minimal listening arc & light symbol
│   │   ├── common/CrisisSupportBanner.tsx # Compassionate crisis resources
│   │   ├── layout/Navbar.tsx            # Sticky responsive nav with sun/moon toggle
│   │   ├── layout/Footer.tsx            # Brand footer & emergency numbers
│   │   └── thoughts/
│   │       ├── ThoughtCard.tsx          # Card with 4 supportive reactions, report & delete
│   │       ├── WritingEditor.tsx        # Journal editor with auto-expanding textarea
│   │       ├── SuccessModal.tsx         # Deletion credential presentation & close button
│   │       ├── ReportModal.tsx          # Discreet reporting modal
│   │       └── DeleteModal.tsx          # Secure author deletion modal
│   ├── context/
│   │   └── ThemeContext.tsx             # Persistent theme provider
│   └── lib/
│       ├── adminAuth.ts                 # Admin HMAC token & passcode validation
│       ├── normalization.ts             # Unicode NFKC, text normalization & SHA-256
│       ├── safety.ts                    # Multi-layer safety & crisis detector
│       ├── supabase.ts                  # Supabase PostgreSQL client
│       └── services/
│           └── thoughtService.ts        # Repository layer (Supabase + Local fallback)
├── supabase/
│   └── schema.sql                       # Complete PostgreSQL schema, RLS & triggers
├── scripts/
│   └── test-suite.ts                    # Full-stack automated verification test suite
└── public/
    └── favicon.svg                      # Brand listening circle SVG favicon
```

---

## 🔒 Anonymity & Cryptographic Deletion

1. **No Account Required**: Authors submit thoughts without logging in.
2. **Cryptographic Deletion Credential**: Upon publication, a cryptographically random token (e.g. `unspoken-del-...`) is generated and presented to the author.
3. **One-Way SHA-256 Hash**: The database **only** stores `SHA-256(token)`. The plain token is never saved on our servers.
4. **Permanent Author Deletion**: When the author wishes to delete their post, they paste their token. The server performs a timing-safe hash comparison and permanently erases the thought.

---

## 🛡️ Multi-Layer Safety & Crisis Screening

- **Layer 1: Input Validation**: Blocks empty submissions, character flood spam, and requests exceeding the technical ceiling (100,000 characters).
- **Layer 2: Spam & Rate-Limiting**: Sliding-window rate limiter prevents automated abuse.
- **Layer 3: Harmful Content Detection**:
  - Direct threats of violence and active encouragement of self-harm are strictly blocked.
  - Hate speech is flagged and held for administrative review.
  - **Compassionate Crisis Detection**: Distinguishes between someone inflicting harm and someone in pain. Expressions of suffering are preserved while discreetly offering verified crisis contacts (Tele-MANAS, emergency 112, 988, etc.).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

*Note: UnSpoken is fully functional out-of-the-box using the local persistent engine in `.data/unspoken-store.json`.*

### 3. Connect Supabase (Optional for Production)
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor in Supabase and run `supabase/schema.sql`.
3. Add your credentials to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Admin Access
Administrative access to the `/admin` moderation portal is protected by server-side authentication. To access the portal, configure a secure secret passcode in your environment variables:

```bash
ADMIN_SECRET_KEY=your-secure-admin-passcode
```

When navigating to `/admin`, enter this configured passcode to authenticate your administrative session.

---

## 🧪 Verification & Testing

Run the automated test suite covering normalization, duplicate detection, cryptographic deletion, safety screening, reactions, reporting, and admin authentication:
```bash
npm test
```

Build for production:
```bash
npm run build
```

---

*Even silence deserves to be heard.*
