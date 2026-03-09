import { NextResponse, type NextRequest } from "next/server";

function isAuthorized(request: NextRequest): boolean {
  const syncSecret = process.env.LINKEDIN_SYNC_SECRET;
  if (!syncSecret) return false;

  const secretFromHeader = request.headers.get("x-linkedin-sync-secret");
  const secretFromQuery = request.nextUrl.searchParams.get("secret");

  return secretFromHeader === syncSecret || secretFromQuery === syncSecret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const syncUrl = new URL("/api/integrations/linkedin/sync", request.url);
  syncUrl.searchParams.set("secret", process.env.LINKEDIN_SYNC_SECRET || "");

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const limit = body && typeof body.limit === "number" ? body.limit : 10;

  await fetch(syncUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-linkedin-sync-secret": process.env.LINKEDIN_SYNC_SECRET || "",
    },
    body: JSON.stringify({ limit }),
    cache: "no-store",
  }).catch(() => null);

  return NextResponse.json({ ok: true, message: "Webhook ricevuto, sync avviata" });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, message: "LinkedIn webhook endpoint attivo" });
}
