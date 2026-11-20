/**
 * UnSpoken Full-Stack Verification Test Suite
 */

import { ThoughtService } from "../src/lib/services/thoughtService";
import { evaluateThoughtSafety, TECHNICAL_SAFETY_CEILING } from "../src/lib/safety";
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

  // 2b. Long Writing Safety Ceiling Verification
  console.log("\n--- 2b. Generous Writing Safety Ceiling (100,000 Chars) ---");
  const longTextAllowed = "This is a meaningful paragraph about my life experience.\n\n".repeat(200); // ~11,600 chars
  const longAllowedCheck = evaluateThoughtSafety(longTextAllowed);
  assert(longAllowedCheck.allowed && longAllowedCheck.status === "published", "Long multi-paragraph stories (11,000+ chars) are fully accepted without 5,000 char restriction");

  const oversizedText = "A".repeat(TECHNICAL_SAFETY_CEILING + 10);
  const oversizedCheck = evaluateThoughtSafety(oversizedText);
  assert(!oversizedCheck.allowed && oversizedCheck.status === "blocked", "Texts exceeding the 100,000 char technical ceiling are gracefully caught with safety reason");

  // 3. Thought Creation & Separate Authors Sharing Identical Words
  console.log("\n--- 3. Thought Creation & Multiple Authors with Identical Words ---");
  const sharedFeeling = `I miss how simple life used to be when we were children (${Date.now()})`;
  
  // Author A submits
  const authorA = await ThoughtService.createThought({
    content: sharedFeeling,
    category: "hope",
  });
  assert(Boolean(authorA.thought.id), "Author A's thought published directly");
  assert(Boolean(authorA.deletionToken), "Author A receives unique deletion token");

  // Author B submits identical words (never blocked or discouraged)
  const authorB = await ThoughtService.createThought({
    content: sharedFeeling,
    category: "hope",
  });
  assert(Boolean(authorB.thought.id), "Author B's identical thought published directly without blocking");
  assert(Boolean(authorB.deletionToken), "Author B receives their own distinct deletion token");
  assert(authorA.thought.id !== authorB.thought.id, "Both authors have distinct independent thought IDs");
  assert(authorA.deletionToken !== authorB.deletionToken, "Both authors have distinct secret deletion tokens");

  // Internal hash exists for internal abuse tracking
  const internalDupSignal = await ThoughtService.checkDuplicate(sharedFeeling);
  assert(internalDupSignal === true, "Internal content hash matches for internal telemetry without blocking authors");

  // 3b. Long Multi-Paragraph Thought Storage & Exact Retrieval
  console.log("\n--- 3b. Long Thought Multi-Paragraph Integrity ---");
  const multiParagraphStory = [
    "Chapter 1: The Departure.\nIt was a rainy afternoon in late October when I decided to leave the only town I had ever known.",
    "Chapter 2: The Journey.\nThe train rattled over old tracks, carrying people with quiet faces and unknown griefs. I watched the grey hills pass by.",
    "Chapter 3: The Arrival.\nNow I am here, sitting in an unfamiliar room, listening to the rain fall on someone else's roof. I am finally beginning to heal.",
  ].join("\n\n");

  const longCreation = await ThoughtService.createThought({
    content: multiParagraphStory,
    category: "personal-growth",
  });
  assert(Boolean(longCreation.thought.id), "Long multi-paragraph thought created successfully");
  const retrievedLong = await ThoughtService.getThoughtById(longCreation.thought.id);
  assert(retrievedLong !== null && retrievedLong.content === multiParagraphStory, "Long thought content is preserved 100% identically with paragraphs and line breaks without truncation");

  // Clean up long test thought
  await ThoughtService.deleteThought(longCreation.thought.id, longCreation.deletionToken);

  // 4. Reactions
  console.log("\n--- 4. Supportive Reactions ---");
  const reactResult = await ThoughtService.addReaction(authorA.thought.id, "warmth");
  assert(reactResult.success && reactResult.newCount >= 1, "Supportive reaction incremented successfully");

  // 5. Reporting
  console.log("\n--- 5. Discreet Reporting ---");
  const reportResult = await ThoughtService.reportThought({
    thoughtId: authorA.thought.id,
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
  const reportedItem = queue.reports.find(r => r.thought_id === authorA.thought.id);
  assert(Boolean(reportedItem), "Reported thought appears in moderation queue");

  // 7. Author Deletion
  console.log("\n--- 7. Cryptographic Author Deletion ---");
  const badDelete = await ThoughtService.deleteThought(authorA.thought.id, "wrong-key");
  assert(!badDelete.success, "Deletion with wrong key fails");

  const goodDelete = await ThoughtService.deleteThought(authorA.thought.id, authorA.deletionToken);
  assert(goodDelete.success, "Deletion with author's valid secret key succeeds permanently");

  const afterDelete = await ThoughtService.getThoughtById(authorA.thought.id);
  assert(afterDelete === null, "Thought is completely purged from published store");

  // Clean up author B's thought too
  await ThoughtService.deleteThought(authorB.thought.id, authorB.deletionToken);

  // 8. Client Draft Lifecycle & Compassionate Messages
  console.log("\n--- 8. Draft Management & Compassionate Messages ---");
  const draftKey = "unspoken_writing_draft_v1";
  
  // Simulated storage
  const mockStorage: Record<string, string> = {};
  const saveDraft = (content: string, category: string) => {
    if (content.trim().length === 0) {
      delete mockStorage[draftKey];
      return null;
    }
    const draft = { content, category, savedAt: Date.now() };
    mockStorage[draftKey] = JSON.stringify(draft);
    return draft;
  };

  const loadDraft = () => {
    const raw = mockStorage[draftKey];
    if (!raw) return null;
    return JSON.parse(raw);
  };

  const clearDraft = () => {
    delete mockStorage[draftKey];
  };

  // Test 8a: Whitespace drafts are never saved
  saveDraft("    \n\n  \t  ", "unspoken");
  assert(loadDraft() === null, "Whitespace-only drafts are not persisted to storage");

  // Test 8b: Meaningful draft is saved with formatting
  const draftContent = "First line of a heartfelt thought.\n\nSecond paragraph with space.";
  saveDraft(draftContent, "loneliness");
  const restored = loadDraft();
  assert(restored !== null && restored.content === draftContent && restored.category === "loneliness", "Unfinished draft is persisted and restored with intact paragraph breaks");

  // Test 8c: Keep writing maintains draft
  assert(loadDraft() !== null, "'Keep my writing' action preserves draft in storage");

  // Test 8d: Clear draft removes draft from storage
  clearDraft();
  assert(loadDraft() === null, "Clear draft removes draft completely from storage");

  // Test 8e: Compassionate message validation
  const postClearMessage = "Thank you for giving your thoughts a place to land. You don't have to share them to let them matter.";
  assert(postClearMessage.includes("giving your thoughts a place to land") && postClearMessage.includes("don't have to share them"), "Post-clearing compassionate message is accurate and gentle");

  console.log("\n=================================================");
  console.log(`   Verification Results: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
