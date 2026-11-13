import { NextRequest, NextResponse } from "next/server";
import { ThoughtService } from "@/lib/services/thoughtService";
import { checkRateLimit } from "@/lib/safety";

const VALID_CATEGORIES = [
  "harassment",
  "threats",
  "harmful_encouragement",
  "spam",
  "privacy_violation",
  "other",
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

    const rateCheck = checkRateLimit(`report-${ip}`, 5, 60 * 1000);
    if (rateCheck.limited) {
      return NextResponse.json(
        { error: "Too many reports submitted. Please wait a moment." },
        { status: 429 }
      );
    }

    const { category, description } = await request.json();

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Please select a valid report reason." },
        { status: 400 }
      );
    }

    const result = await ThoughtService.reportThought({
      thoughtId: id,
      category,
      description: typeof description === "string" ? description.slice(0, 1000) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for looking out for our community. This submission will be reviewed discreetly.",
      reportId: result.reportId,
    });
  } catch (err: any) {
    console.error("Report error:", err);
    return NextResponse.json(
      { error: "Failed to submit report." },
      { status: 500 }
    );
  }
}
