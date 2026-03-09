import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isEditorAuthorized } from "@/lib/editor-auth";
import { getSanityWriteClient, isSanityWriteConfigured } from "@/lib/sanity";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sanitizeFilename(fileName: string, fallbackExtension = "jpg"): string {
  const trimmed = fileName.trim().toLowerCase();
  const normalized = trimmed
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "");

  if (!normalized) {
    return `editor-image-${randomUUID()}.${fallbackExtension}`;
  }

  return normalized.slice(0, 120);
}

function extensionFromMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: NextRequest) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isSanityWriteConfigured) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sanity write non configurato. Imposta SANITY_API_WRITE_TOKEN.",
      },
      { status: 500 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const imageValue = formData?.get("image");

  if (!(imageValue instanceof File)) {
    return NextResponse.json({ ok: false, message: "File immagine mancante" }, { status: 400 });
  }

  if (!imageValue.size) {
    return NextResponse.json({ ok: false, message: "File vuoto" }, { status: 400 });
  }

  if (imageValue.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ ok: false, message: "Immagine troppo grande (max 8 MB)" }, { status: 413 });
  }

  if (imageValue.type && !ALLOWED_IMAGE_TYPES.has(imageValue.type)) {
    return NextResponse.json(
      { ok: false, message: "Formato non supportato. Usa JPG, PNG, WEBP o GIF." },
      { status: 415 },
    );
  }

  const client = getSanityWriteClient();

  if (!client) {
    return NextResponse.json({ ok: false, message: "Client Sanity non disponibile" }, { status: 500 });
  }

  const extension = extensionFromMimeType(imageValue.type);
  const filename = sanitizeFilename(imageValue.name, extension);

  try {
    const bytes = await imageValue.arrayBuffer();
    const upload = await client.assets.upload("image", Buffer.from(bytes), {
      filename,
      contentType: imageValue.type || undefined,
    });

    if (!upload.url) {
      return NextResponse.json(
        { ok: false, message: "Upload completato ma URL non disponibile" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      url: upload.url,
      assetId: upload._id,
      originalName: imageValue.name || filename,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore durante upload immagine";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
