import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function serviceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function getAdminApp(): App | null {
  const account = serviceAccount();
  if (!account) {
    return null;
  }
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp({ credential: cert(account) });
}

export function getDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export function getServerAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}