import { NextRequest, NextResponse } from "next/server";
import { ThoughtService } from "@/lib/services/thoughtService";
import { evaluateThoughtSafety, checkRateLimit } from "@/lib/safety";
import { computeContentHash } from "@/lib/normalization";

// Memory cache to detect rapid automated bot flooding of identical text from the same IP
const recentSubmissionsByIp = new Map<string, { hash: string; time: number }>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const category = searchParams.get("category") || "all";

    const result = await ThoughtService.getThoughts({ page, limit, category });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("GET /api/thoughts error:", err);
    return NextResponse.json(
      { error: "Could not retrieve thoughts at this moment." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Technical Abuse Prevention: Rate Limiting by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "anonymous-client";

    const rateCheck = checkRateLimit(ip, 8, 60 * 1000);
    if (rateCheck.limited) {
      return NextResponse.json(
        {
          error: `Please take a breath. You may share another thought in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { content, category } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required." },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    // 2. Anti-Flooding: Detect automated rapid repeated submissions of the exact same content from the same IP (< 5 seconds)
    const contentHash = computeContentHash(trimmedContent);
    const lastFromIp = recentSubmissionsByIp.get(ip);
    const now = Date.now();

    if (lastFromIp && lastFromIp.hash === contentHash && now - lastFromIp.time < 5000) {
      return NextResponse.json(
        {
          error: "Your thought was already received a moment ago.",
        },
        { status: 429 }
      );
    }

    recentSubmissionsByIp.set(ip, { hash: contentHash, time: now });

    // Clean up cache periodically
    if (recentSubmissionsByIp.size > 2000) {
      for (const [key, value] of recentSubmissionsByIp.entries()) {
        if (now - value.time > 60000) {
          recentSubmissionsByIp.delete(key);
        }
      }
    }

    // 3. Safety & Moderation screening (Harassment, threats, self-harm encouragement vs genuine emotional pain)
    const safety = evaluateThoughtSafety(trimmedContent);
    if (!safety.allowed && safety.status === "blocked") {
      return NextResponse.json(
        { error: safety.reason || "Unable to publish this submission." },
        { status: 400 }
      );
    }

    // 4. Save Thought directly without any similarity blocking or confirmation modals
    // Different people expressing similar or identical feelings are fully welcomed.
    const initialStatus = safety.status === "held" ? "held" : "published";
    const result = await ThoughtService.createThought({
      content: trimmedContent,
      category: category || "unspoken",
      status: initialStatus,
    });

    return NextResponse.json(
      {
        success: true,
        thought: result.thought,
        deletionToken: result.deletionToken,
        status: initialStatus,
        crisisDetected: safety.crisisDetected,
        crisisMessage: safety.crisisMessage,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/thoughts error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while saving your thought." },
      { status: 500 }
    );
  }
}
