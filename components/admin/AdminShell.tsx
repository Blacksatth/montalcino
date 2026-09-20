import { AdminAppShell } from "@/components/admin/AdminAppShell";
import type { ReactNode } from "react";

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  return <AdminAppShell email={email}>{children}</AdminAppShell>;
}