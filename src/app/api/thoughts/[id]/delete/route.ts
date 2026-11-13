import { NextRequest, NextResponse } from "next/server";
import { ThoughtService } from "@/lib/services/thoughtService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { deletionToken } = await request.json();

    if (!deletionToken || typeof deletionToken !== "string") {
      return NextResponse.json(
        { error: "Deletion key is required." },
        { status: 400 }
      );
    }

    const result = await ThoughtService.deleteThought(id, deletionToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error("Delete thought error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting." },
      { status: 500 }
    );
  }
}
