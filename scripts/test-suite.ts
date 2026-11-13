/**
 * UnSpoken Full-Stack Verification Test Suite
 */

import { ThoughtService } from "../src/lib/services/thoughtService";
import { evaluateThoughtSafety } from "../src/lib/safety";
import { normalizeText, computeContentHash, generateDeletionToken, verifyDeletionToken, hashDeletionToken } from "../src/lib/normalization";
import { checkAdminPasscode, generateAdminToken, verifyAdminToken } from "../src/lib/adminAuth";

async function runTests() {
  console.log("=================================================");
  console.log("   UnSpoken Comprehensive Verification Suite     ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Normalization & Cryptography
  console.log("--- 1. Normalization & Cryptographic Hashes ---");
  const raw1 = "  Sometimes I Wonder... If Anyone   Hears Me!  ";
  const norm1 = normalizeText(raw1);
  assert(norm1 === "sometimes i wonder. if anyone hears me!", "Normalizes whitespace, lowercase, and repeated punctuation");

  const hash1 = computeContentHash("Hello world");
  const hash2 = computeContentHash("   hello   world   ");
  assert(hash1 === hash2, "Content hashes match despite whitespace differences");

  const token = generateDeletionToken();
  assert(token.startsWith("unspoken-del-") && token.length > 20, "Deletion token has correct prefix and length");
  const tokenHash = hashDeletionToken(token);
  assert(verifyDeletionToken(token, tokenHash), "Cryptographic deletion token verifies against SHA-256 hash");
  assert(!verifyDeletionToken("wrong-token", tokenHash), "Rejects invalid deletion token");

  // 2. Safety & Moderation screening
  console.log("\n--- 2. Multi-Layer Safety Engine ---");
  const safeCheck = evaluateThoughtSafety("I moved to a quiet village and miss the sound of the ocean.");
  assert(safeCheck.allowed && safeCheck.status === "published", "Normal benign thoughts are published immediately");

  const emptyCheck = evaluateThoughtSafety("  a  ");
  assert(!emptyCheck.allowed, "Too short submissions are blocked");

  const spamCheck = evaluateThoughtSafety("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  assert(!spamCheck.allowed, "Repetitive character spam is blocked");

  const threatCheck = evaluateThoughtSafety("I will track down and kill you all");
  assert(!threatCheck.allowed && threatCheck.status === "blocked", "Violent threats are blocked");

  const selfHarmEncouragement = evaluateThoughtSafety("You should kill yourself nobody wants you");
  assert(!selfHarmEncouragement.allowed && selfHarmEncouragement.status === "blocked", "Harmful encouragement is strictly blocked");

  const sufferingCheck = evaluateThoughtSafety("I feel so hopeless and I can't take the pain anymore, it feels like a heavy burden.");
  assert(sufferingCheck.allowed && sufferingCheck.crisisDetected, "Emotional distress is allowed and crisis support is offered without silencing");

  // 3. Thought Creation & Duplicate Detection
  console.log("\n--- 3. Thought Creation, Duplicate Detection & Deletion ---");
  const uniqueContent = `A very unique thought created for testing at ${Date.now()}`;
  const creation = await ThoughtService.createThought({
    content: uniqueContent,
    category: "hope",
  });
  assert(Boolean(creation.thought.id), "Thought created with public ID");
  assert(Boolean(creation.deletionToken), "Secure deletion token returned to author");

  // Check duplicate detection
  const isDup = await ThoughtService.checkDuplicate(uniqueContent);
  assert(isDup === true, "Identical content detected as duplicate");

  const isDupSpaced = await ThoughtService.checkDuplicate(`   ${uniqueContent.toUpperCase()}   `);
  assert(isDupSpaced === true, "Case-insensitive and whitespace-normalized duplicate detected");

  // 4. Reactions
  console.log("\n--- 4. Supportive Reactions ---");
  const reactResult = await ThoughtService.addReaction(creation.thought.id, "warmth");
  assert(reactResult.success && reactResult.newCount >= 1, "Supportive reaction incremented successfully");

  // 5. Reporting
  console.log("\n--- 5. Discreet Reporting ---");
  const reportResult = await ThoughtService.reportThought({
    thoughtId: creation.thought.id,
    category: "other",
    description: "Testing report flow",
  });
  assert(reportResult.success, "Report submitted discreetly");

  // 6. Admin operations
  console.log("\n--- 6. Admin Authentication & Queue ---");
  assert(checkAdminPasscode("unspoken-admin-safe-2026"), "Admin passcode verifies");
  assert(!checkAdminPasscode("wrong-pass"), "Invalid admin passcode rejected");

  const adminToken = generateAdminToken();
  assert(verifyAdminToken(adminToken), "Admin session HMAC verifies");

  const queue = await ThoughtService.getModerationQueue();
  const reportedItem = queue.reports.find(r => r.thought_id === creation.thought.id);
  assert(Boolean(reportedItem), "Reported thought appears in moderation queue");

  // 7. Author Deletion
  console.log("\n--- 7. Cryptographic Author Deletion ---");
  const badDelete = await ThoughtService.deleteThought(creation.thought.id, "wrong-key");
  assert(!badDelete.success, "Deletion with wrong key fails");

  const goodDelete = await ThoughtService.deleteThought(creation.thought.id, creation.deletionToken);
  assert(goodDelete.success, "Deletion with author's valid secret key succeeds permanently");

  const afterDelete = await ThoughtService.getThoughtById(creation.thought.id);
  assert(afterDelete === null, "Thought is completely purged from published store");

  console.log("\n=================================================");
  console.log(`   Verification Results: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
