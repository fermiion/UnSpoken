import { NextRequest, NextResponse } from "next/server";
import { ThoughtService } from "@/lib/services/thoughtService";
import { evaluateThoughtSafety, checkRateLimit } from "@/lib/safety";

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
    // 1. Rate Limiting Check (by IP)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "anonymous-client";

    const rateCheck = checkRateLimit(ip, 6, 60 * 1000);
    if (rateCheck.limited) {
      return NextResponse.json(
        {
          error: `Please take a breath. You may share another thought in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { content, category, acknowledgeDuplicate } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required." },
        { status: 400 }
      );
    }

    // 2. Safety & Moderation screening
    const safety = evaluateThoughtSafety(content);
    if (!safety.allowed && safety.status === "blocked") {
      return NextResponse.json(
        { error: safety.reason || "Unable to publish this submission." },
        { status: 400 }
      );
    }

    // 3. Duplicate Detection Check
    const isDuplicate = await ThoughtService.checkDuplicate(content);
    if (isDuplicate && !acknowledgeDuplicate) {
      return NextResponse.json(
        {
          duplicateDetected: true,
          message:
            "It looks like this thought has already been shared. Would you still like to share it?",
        },
        { status: 409 }
      );
    }

    // 4. Save Thought
    const initialStatus = safety.status === "held" ? "held" : "published";
    const result = await ThoughtService.createThought({
      content: content.trim(),
      category: category || "unspoken",
      status: initialStatus,
      is_duplicate_acknowledged: Boolean(isDuplicate && acknowledgeDuplicate),
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
