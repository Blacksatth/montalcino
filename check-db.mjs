import { config } from "dotenv";
config({ path: ".env.local" });
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!raw) {
  console.error("No FIREBASE_SERVICE_ACCOUNT_JSON");
  process.exit(1);
}
let account;
try {
  account = JSON.parse(raw);
} catch (e) {
  console.error("Parse error:", e);
  process.exit(1);
}
const app = getApps()[0] ?? initializeApp({ credential: cert(account) });
const db = getFirestore(app);

const snap = await db.collection("collections").get();
console.log("Collections count:", snap.size);
snap.docs.forEach(doc => {
  const data = doc.data();
  console.log(doc.id, { active: data.active, order: data.order, name: data.name });
});

const catSnap = await db.collection("categories").get();
console.log("Categories count:", catSnap.size);

const prodSnap = await db.collection("products").get();
console.log("Products count:", prodSnap.size);
