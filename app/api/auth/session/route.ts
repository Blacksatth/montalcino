import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAllowedEmail } from "@/lib/auth";
import { getServerAuth } from "@/lib/firebase/admin";

const SEVEN_DAYS_MS = 60 * 60 * 24 * 7 * 1000;

export async function POST(request: NextRequest) {
  const auth = getServerAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "La autenticación aún no está configurada en el servidor." },
      { status: 503 },
    );
  }

  let idToken: string;
  try {
    const body = (await request.json()) as { idToken?: unknown };
    idToken = typeof body.idToken === "string" ? body.idToken : "";
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (!idToken) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  let email: string;
  try {
    const decoded = await auth.verifyIdToken(idToken);
    email = decoded.email ?? "";
  } catch {
    return NextResponse.json({ error: "La sesión no es válida." }, { status: 401 });
  }

  if (!isAllowedEmail(email)) {
    return NextResponse.json(
      { error: "Tu correo no está autorizado para el panel." },
      { status: 403 },
    );
  }

  let sessionCookie: string;
  try {
    sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SEVEN_DAYS_MS,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo iniciar la sesión." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_MS / 1000,
  });
  return response;
}