import { NextRequest, NextResponse } from "next/server";
import { ThoughtService } from "@/lib/services/thoughtService";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    if (!content || typeof content !== "string" || content.trim().length < 3) {
      return NextResponse.json({ isDuplicate: false });
    }

    const isDuplicate = await ThoughtService.checkDuplicate(content);
    return NextResponse.json({ isDuplicate });
  } catch (err: any) {
    console.error("Duplicate check error:", err);
    return NextResponse.json({ isDuplicate: false });
  }
}
