import { config } from "dotenv";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
config({ path: "C:/Users/santi/Documents/react/montalchino/montalchino/.env.local" });

export default async function run(page) {
  const results = {};
  const { cert, getApps, initializeApp: initAdmin } = require("firebase-admin/app");
  const { getAuth: getAdminAuth } = require("firebase-admin/auth");
  const { initializeApp: initClient } = require("firebase/app");
  const { getAuth: getClientAuth, signInWithCustomToken } = require("firebase/auth");
  const adminApp = getApps()[0] ?? initAdmin({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
  const adminAuth = getAdminAuth(adminApp);
  const clientApp = initClient(
    {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
    "qa-prodlist",
  );
  const uid = (await adminAuth.getUserByEmail("santiagocifuenteslora@gmail.com")).uid;
  const cred = await signInWithCustomToken(getClientAuth(clientApp), await adminAuth.createCustomToken(uid));
  const idToken = await cred.user.getIdToken(true);
  const sessionRes = await fetch("http://localhost:3000/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const cookieVal = (sessionRes.headers.get("set-cookie") ?? "").split(";")[0].split("=").slice(1).join("=");
  await page.context().addCookies([{ name: "session", value: cookieVal, url: "http://localhost:3000" }]);

  await page.goto("http://localhost:3000/admin/productos", { waitUntil: "domcontentloaded" });
  await page.getByText("Productos").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(1200);

  const bodyText = await page.evaluate(() => document.body.textContent || "");
  results.hasOcultar = bodyText.includes("Ocultar");
  results.hasPublicar = bodyText.includes("Publicar");
  results.editLinks = await page.getByRole("link", { name: "Editar" }).count();
  results.deleteButtons = await page.getByRole("button", { name: "Eliminar" }).count();

  const firstEdit = page.getByRole("link", { name: "Editar" }).first();
  const href = await firstEdit.getAttribute("href");
  results.firstEditHref = href;
  await firstEdit.click();
  await page.waitForTimeout(2000);
  results.urlAfterEdit = page.url();
  results.editNavigates = page.url().match(/\/admin\/productos\/[^/]+$/) !== null;

  return results;
}