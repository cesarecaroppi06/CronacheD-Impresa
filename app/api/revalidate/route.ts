import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

type RevalidatePayload = {
  slug?: string;
  path?: string;
};

function isAuthorized(secret: string | null | undefined): boolean {
  return Boolean(secret && process.env.SANITY_REVALIDATE_SECRET && secret === process.env.SANITY_REVALIDATE_SECRET);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as RevalidatePayload;
  const secretFromUrl = request.nextUrl.searchParams.get("secret");
  const secretFromBody =
    typeof (payload as { secret?: string }).secret === "string"
      ? (payload as { secret?: string }).secret
      : null;
  const secret = secretFromUrl ?? secretFromBody;

  if (!isAuthorized(secret)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/articoli");
  revalidatePath("/interviste");
  revalidatePath("/imprese");
  revalidatePath("/insights");

  if (payload.path) {
    revalidatePath(payload.path);
  }

  if (payload.slug) {
    revalidatePath(`/articoli/${payload.slug}`);
  }

  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (!isAuthorized(secret)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
