import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/adminAuth";
import { ThoughtService } from "@/lib/services/thoughtService";

export async function GET() {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const queue = await ThoughtService.getModerationQueue();
    return NextResponse.json(queue);
  } catch (err: any) {
    console.error("Admin queue error:", err);
    return NextResponse.json(
      { error: "Could not retrieve moderation queue." },
      { status: 500 }
    );
  }
}
