import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/adminAuth";
import { ThoughtService } from "@/lib/services/thoughtService";

export async function POST(request: NextRequest) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { actionType, thoughtId, reportId, decision, action, notes } = body;

    if (actionType === "thought" && thoughtId && decision) {
      await ThoughtService.applyModerationAction({
        thoughtId,
        decision,
        notes,
      });
      return NextResponse.json({ success: true, message: "Moderation action applied." });
    }

    if (actionType === "report" && reportId && action) {
      await ThoughtService.resolveReport({
        reportId,
        action,
        notes,
      });
      return NextResponse.json({ success: true, message: "Report resolved." });
    }

    return NextResponse.json({ error: "Invalid action parameters." }, { status: 400 });
  } catch (err: any) {
    console.error("Admin moderation error:", err);
    return NextResponse.json(
      { error: "Failed to apply moderation decision." },
      { status: 500 }
    );
  }
}
