import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function checkEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return { cloudName, apiKey };
}

export async function POST() {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const env = checkEnv();
  if (!env) {
    return NextResponse.json(
      { error: "Cloudinary no está configurado." },
      { status: 503 },
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "montalchino";
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET ?? "",
  );

  return NextResponse.json({
    timestamp,
    folder,
    signature,
    cloudName: env.cloudName,
    apiKey: env.apiKey,
  });
}
