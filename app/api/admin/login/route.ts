import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAge,
  validateAdminCredentials,
} from "@/lib/admin-auth";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as LoginPayload;
  const email = payload.email?.trim() || "";
  const password = payload.password || "";
  const normalizedEmail = validateAdminCredentials(email, password);

  if (!normalizedEmail) {
    return NextResponse.json(
      { ok: false, message: "Credenziali non valide o utente non autorizzato." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    email: normalizedEmail,
  });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: createAdminSessionToken(normalizedEmail),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminSessionMaxAge(),
  });

  return response;
}
