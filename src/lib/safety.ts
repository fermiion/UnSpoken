/**
 * Safety and Multi-layered Content Moderation Engine
 * 
 * Philosophy:
 * - Emotional distress and suffering are allowed and embraced with compassionate crisis guidance.
 * - Targeted harassment, violent threats, doxxing, and active encouragement of self-harm are blocked or held.
 */

export interface ModerationResult {
  allowed: boolean;
  status: "published" | "held" | "blocked";
  crisisDetected: boolean;
  reason?: string;
  crisisMessage?: string;
}

// Patterns that actively encourage harm to others or self (strictly blocked)
const HARMFUL_ENCOURAGEMENT_PATTERNS = [
  /\b(kill\s+yourself|commit\s+suicide|kys|go\s+die|hang\s+yourself)\b/i,
  /\b(you\s+should\s+die|you\s+deserve\s+to\s+die|drink\s+bleach)\b/i,
  /\b(cut\s+yourself|end\s+your\s+life)\b/i,
];

// Targeted threats and violence towards others (strictly blocked)
const VIOLENT_THREAT_PATTERNS = [
  /\b(i\s+will\s+kill\s+you|i\s+will\s+murder\s+you|i'm\s+going\s+to\s+shoot|i\s+will\s+bomb)\b/i,
  /\b(i\s+will\s+doxx|track\s+down\s+and\s+kill)\b/i,
];

// Severe hate speech & slurs (held or blocked)
const HATE_SPEECH_PATTERNS = [
  /\b(gas\s+the\s+jews|nigger|faggot|chink|kike)\b/i,
];

// Expressions of personal emotional pain & crisis (Allowed, but trigger compassionate support resources)
const PERSONAL_CRISIS_PATTERNS = [
  /\b(want\s+to\s+die|don't\s+want\s+to\s+live\s+anymore|feel\s+like\s+ending\s+it)\b/i,
  /\b(tired\s+of\s+living|no\s+reason\s+to\s+live|hopeless|cannot\s+go\s+on)\b/i,
  /\b(hurting\s+myself|self\s*harm|overdose|nobody\s+cares\s+if\s+i\s+die)\b/i,
  /\b(heavy\s+burden|lost\s+everything|can't\s+take\s+the\s+pain)\b/i,
];

// Spam / Gibberish detection
function isGibberishOrRepetition(text: string): boolean {
  // Check if text is repetitive characters like "aaaaaa" or "asdfasdfasdf"
  const repeatedChar = /(.)\1{12,}/;
  if (repeatedChar.test(text)) return true;

  // Check character variety for texts longer than 40 chars
  if (text.length > 40) {
    const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, "")).size;
    if (uniqueChars < 4) return true;
  }

  return false;
}

// Technical safety ceiling for server requests (100,000 characters)
export const TECHNICAL_SAFETY_CEILING = 100000;

/**
 * Evaluates a submitted thought against safety layers
 */
export function evaluateThoughtSafety(content: string): ModerationResult {
  const trimmed = content.trim();

  // Layer 1: Basic validation
  if (!trimmed || trimmed.length < 3) {
    return {
      allowed: false,
      status: "blocked",
      crisisDetected: false,
      reason: "Your thought is too brief to share. Take your time and write a little more.",
    };
  }

  // Generous technical safety ceiling (100,000 characters)
  if (trimmed.length > TECHNICAL_SAFETY_CEILING) {
    return {
      allowed: false,
      status: "blocked",
      crisisDetected: false,
      reason: "Your reflection has reached the technical safety ceiling. If possible, consider sharing it in parts so nothing is lost.",
    };
  }

  if (isGibberishOrRepetition(trimmed)) {
    return {
      allowed: false,
      status: "blocked",
      crisisDetected: false,
      reason: "The submission appears to contain repetitive or meaningless text.",
    };
  }

  // Layer 2: Harmful encouragement & threats (blocked)
  for (const pattern of HARMFUL_ENCOURAGEMENT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        status: "blocked",
        crisisDetected: false,
        reason: "Content encouraging harm to self or others is strictly prohibited on UnSpoken.",
      };
    }
  }

  for (const pattern of VIOLENT_THREAT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        status: "blocked",
        crisisDetected: false,
        reason: "Threats of violence are not permitted.",
      };
    }
  }

  // Layer 3: Hate speech (held for moderator review)
  for (const pattern of HATE_SPEECH_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: true,
        status: "held",
        crisisDetected: false,
        reason: "This submission was flagged for review by our moderation team.",
      };
    }
  }

  // Layer 4: Compassionate Crisis Screening
  let crisisDetected = false;
  let crisisMessage: string | undefined = undefined;

  for (const pattern of PERSONAL_CRISIS_PATTERNS) {
    if (pattern.test(trimmed)) {
      crisisDetected = true;
      crisisMessage =
        "We hear your pain, and you don't have to carry this alone. Please know there are people ready to listen with kindness. If you need immediate support, confidential helplines are available.";
      break;
    }
  }

  // Safe to publish!
  return {
    allowed: true,
    status: "published",
    crisisDetected,
    crisisMessage,
  };
}

// In-memory sliding window rate limiter for submissions
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 5,
  windowMs = 60 * 1000
): { limited: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier) || { timestamps: [] };

  // Filter out timestamps outside the window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return { limited: true, retryAfterSeconds };
  }

  record.timestamps.push(now);
  rateLimitMap.set(identifier, record);

  // Periodic cleanup if map grows large
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.timestamps.every((ts) => now - ts >= windowMs)) {
        rateLimitMap.delete(key);
      }
    }
  }

  return { limited: false };
}
