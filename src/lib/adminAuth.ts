import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "unspoken-admin-safe-2026";
const COOKIE_NAME = "unspoken_admin_token";

export function generateAdminToken(): string {
  return crypto.createHmac("sha256", ADMIN_SECRET).update("admin_authenticated_session").digest("hex");
}

export function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  const expected = generateAdminToken();
  try {
    return crypto.timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function isUserAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export function checkAdminPasscode(passcode: string): boolean {
  if (!passcode) return false;
  return passcode.trim() === ADMIN_SECRET;
}

export { COOKIE_NAME };
