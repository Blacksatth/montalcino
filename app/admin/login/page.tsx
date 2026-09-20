import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSessionUser();
  if (session) {
    redirect("/admin");
  }
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
      <h1 className="text-center font-serif text-3xl">Panel de Montalchino</h1>
      <p className="pt-2 text-center text-sm text-taupe">
        Ingresa con tu correo autorizado.
      </p>
      <LoginForm next={next ?? "/admin"} />
    </div>
  );
}