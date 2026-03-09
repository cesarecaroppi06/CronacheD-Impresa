import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { syncLinkedInToSanity } from "@/lib/linkedin";

type SyncPayload = {
  limit?: number;
};

function isAuthorized(request: NextRequest): boolean {
  if (isAdminRequest(request)) return true;

  const editorKey = process.env.EDITOR_DASHBOARD_KEY;
  const syncSecret = process.env.LINKEDIN_SYNC_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  if (!editorKey && !syncSecret && !cronSecret) return true;

  const keyFromHeader = request.headers.get("x-editor-key");
  const secretFromHeader = request.headers.get("x-linkedin-sync-secret");
  const secretFromQuery = request.nextUrl.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  if (editorKey && keyFromHeader === editorKey) return true;

  if (syncSecret && (secretFromHeader === syncSecret || secretFromQuery === syncSecret)) {
    return true;
  }

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  return false;
}

async function performSync(limit?: number) {
  const result = await syncLinkedInToSanity(limit);

  revalidatePath("/");
  revalidatePath("/articoli");
  revalidatePath("/interviste");
  revalidatePath("/imprese");
  revalidatePath("/insights");

  for (const item of result.items) {
    revalidatePath(item.path);
  }

  return result;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as SyncPayload;
  const limit = typeof payload.limit === "number" && payload.limit > 0 ? Math.min(payload.limit, 50) : 10;

  try {
    const result = await performSync(limit);

    return NextResponse.json({
      ok: true,
      ...result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore sincronizzazione LinkedIn";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 10;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : 10;

  try {
    const result = await performSync(limit);

    return NextResponse.json({
      ok: true,
      ...result,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore sincronizzazione LinkedIn";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
