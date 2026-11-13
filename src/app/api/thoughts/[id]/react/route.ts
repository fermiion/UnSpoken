import { NextRequest, NextResponse } from "next/server";
import { ThoughtService, ReactionType } from "@/lib/services/thoughtService";
import { checkRateLimit } from "@/lib/safety";

const ALLOWED_REACTIONS: ReactionType[] = [
  "hear_you",
  "not_alone",
  "warmth",
  "understand",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "anonymous-client";

    // Rate limit reaction frequency (up to 30 per minute across thoughts)
    const rateCheck = checkRateLimit(`react-${ip}`, 30, 60 * 1000);
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: "Please pause for a moment before reacting again." },
        { status: 429 }
      );
    }

    const { reactionType } = await request.json();

    if (!reactionType || !ALLOWED_REACTIONS.includes(reactionType)) {
      return NextResponse.json(
        { error: "Invalid reaction type." },
        { status: 400 }
      );
    }

    const result = await ThoughtService.addReaction(id, reactionType);
    if (!result.success) {
      return NextResponse.json(
        { error: "Thought not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      newCount: result.newCount,
    });
  } catch (err: any) {
    console.error("Reaction error:", err);
    return NextResponse.json(
      { error: "Failed to record reaction." },
      { status: 500 }
    );
  }
}
