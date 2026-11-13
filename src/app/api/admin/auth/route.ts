import { NextRequest, NextResponse } from "next/server";
import { checkAdminPasscode, generateAdminToken, COOKIE_NAME, isUserAdmin } from "@/lib/adminAuth";

export async function GET() {
  const isAdmin = await isUserAdmin();
  return NextResponse.json({ authenticated: isAdmin });
}

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    if (!passcode || !checkAdminPasscode(passcode)) {
      return NextResponse.json(
        { error: "Invalid administrative credentials." },
        { status: 401 }
      );
    }

    const token = generateAdminToken();
    const response = NextResponse.json({
      success: true,
      message: "Authenticated successfully.",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error("Admin auth error:", err);
    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out.",
  });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
