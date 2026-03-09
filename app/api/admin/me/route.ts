import { NextResponse, type NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);

  return NextResponse.json({
    authenticated: Boolean(session),
    email: session?.email ?? null,
  });
}
