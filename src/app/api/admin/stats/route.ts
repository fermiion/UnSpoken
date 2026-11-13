import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/adminAuth";
import { ThoughtService } from "@/lib/services/thoughtService";

export async function GET() {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const stats = await ThoughtService.getAdminStats();
    const dbStatus = ThoughtService.getStatus();
    return NextResponse.json({ stats, dbStatus });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { error: "Could not retrieve statistics." },
      { status: 500 }
    );
  }
}
