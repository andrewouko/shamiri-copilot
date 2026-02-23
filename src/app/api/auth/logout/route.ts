import { clearSessionCookie } from "@/lib/auth";
import { apiOk } from "@/lib/types";

export async function POST() {
  await clearSessionCookie();
  return apiOk({ message: "Logged out successfully" });
}
