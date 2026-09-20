import { redirect } from "next/navigation";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSessionUser, isAllowedEmail } from "@/lib/auth";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/admin/login");
  }
  if (!isAllowedEmail(session.email)) {
    return <AccessDenied />;
  }
  return <AdminShell email={session.email}>{children}</AdminShell>;
}