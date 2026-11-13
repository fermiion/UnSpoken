import crypto from "crypto";

/**
 * Normalizes text for duplicate detection and consistent hashing:
 * 1. Converts to lowercase
 * 2. Normalizes Unicode (NFKC)
 * 3. Removes leading/trailing whitespace
 * 4. Normalizes whitespace to single spaces
 * 5. Normalizes quotes and punctuation
 */
export function normalizeText(text: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    .normalize("NFKC")
    // Replace smart quotes and special apostrophes with standard ones
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Replace multiple punctuation repeats (e.g. "!!!!" -> "!")
    .replace(/([!?,.:;])\1+/g, "$1")
    // Remove invisible characters and zero-width spaces
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Collapse all whitespace (newlines, tabs, multiple spaces) into a single space
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes a SHA-256 cryptographic hash of normalized content
 */
export function computeContentHash(text: string): string {
  const normalized = normalizeText(text);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Generates a secure, random deletion credential for anonymous authors.
 * Example format: unspoken-del-8f2a9c14b7e802
 */
export function generateDeletionToken(): string {
  const randomBytes = crypto.randomBytes(16).toString("hex");
  return `unspoken-del-${randomBytes}`;
}

/**
 * Computes a SHA-256 hash of the deletion token for secure database storage.
 * The original token is never stored in the database.
 */
export function hashDeletionToken(token: string): string {
  const cleanToken = token.trim();
  return crypto.createHash("sha256").update(cleanToken).digest("hex");
}

/**
 * Verifies if a provided deletion token matches the stored token hash
 */
export function verifyDeletionToken(token: string, storedHash: string): boolean {
  if (!token || !storedHash) return false;
  try {
    const computedHash = hashDeletionToken(token);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(storedHash, "hex")
    );
  } catch {
    return false;
  }
}
