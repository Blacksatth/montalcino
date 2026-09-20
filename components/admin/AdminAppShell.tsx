"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode, SVGProps } from "react";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const NAV = [
  {
    href: "/admin",
    label: "Resumen",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <rect x="3" y="3" width="7" height="7" rx="0.5" />
        <rect x="14" y="3" width="7" height="7" rx="0.5" />
        <rect x="3" y="14" width="7" height="7" rx="0.5" />
        <rect x="14" y="14" width="7" height="7" rx="0.5" />
      </svg>
    ),
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
        <path d="M4 7.5 12 12l8-4.5" />
        <path d="M12 12v9" />
      </svg>
    ),
  },
  {
    href: "/admin/colecciones",
    label: "Colecciones",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="M4 7.5 12 12l8-4.5" />
        <path d="M12 12v9" />
        <path d="m8 5.25 8 4.5" />
      </svg>
    ),
  },
  {
    href: "/admin/categorias",
    label: "Categorías",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <path d="M20.5 13.5 13.5 20.5a2 2 0 0 1-2.8 0L3 12.8V3h9.8l7.7 7.7a2 2 0 0 1 0 2.8Z" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Ajustes",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03Z" />
      </svg>
    ),
  },
];

function isActive(href: string, pathname: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={collapsed ? "px-3" : "px-5"}>
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center border border-foreground/20 font-serif text-lg text-foreground">
          M
        </span>
        {!collapsed ? (
          <span className="leading-none">
            <span className="block font-serif text-lg tracking-widest">Montalchino</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.25em] text-taupe">
              Panel
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const active = isActive(href, pathname);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={`group relative flex items-center gap-3 py-2.5 text-sm transition-colors ${
        collapsed ? "justify-center px-2" : "px-4"
      } ${active ? "text-foreground" : "text-taupe hover:text-foreground"}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-accent transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <Icon className={`size-5 shrink-0 ${active ? "text-accent" : ""}`} />
      {!collapsed ? (
        <span className={`uppercase tracking-widest text-xs ${active ? "text-foreground" : ""}`}>
          {label}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarContent({
  email,
  collapsed,
  onNavigate,
}: {
  email: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line py-5">
        <Brand collapsed={collapsed} />
      </div>
      <nav className="flex-1 space-y-1 py-4">
        {NAV.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div
        className={`border-t border-line py-4 ${
          collapsed ? "flex flex-col items-center gap-3" : "space-y-4 px-4"
        }`}
      >
        <ThemeToggle compact={collapsed} />
        {!collapsed ? <p className="truncate text-xs text-taupe">{email}</p> : null}
        <LogoutButton />
      </div>
    </div>
  );
}

export function AdminAppShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const sectionLabel = NAV.find((link) => isActive(link.href, pathname))?.label ?? "Panel";

  return (
    <div className="min-h-screen">
      <div className="flex">
        <aside
          className="hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-300 ease-out lg:flex"
          style={{ width: collapsed ? "4rem" : "16rem" }}
        >
          <SidebarContent email={email} collapsed={collapsed} onNavigate={closeMobile} />
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden border-t border-line py-3 text-taupe transition-colors hover:text-foreground lg:flex lg:items-center lg:justify-center"
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            <svg
              viewBox="0 0 24 24"
              className={`size-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        </aside>

        <div
          className={`fixed inset-0 z-50 lg:hidden ${
            mobileOpen ? "" : "pointer-events-none"
          }`}
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={closeMobile}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            aria-hidden={!mobileOpen}
            className={`absolute inset-y-0 left-0 w-72 border-r border-line bg-surface shadow-xl transition-transform duration-300 ease-out ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SidebarContent email={email} collapsed={false} onNavigate={closeMobile} />
          </aside>
        </div>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-background/85 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex size-9 items-center justify-center text-foreground lg:hidden"
              aria-label="Abrir menú"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm uppercase tracking-[0.2em] text-taupe">
                Panel de Montalchino
              </p>
              <h2 className="truncate font-serif text-lg leading-tight">{sectionLabel}</h2>
            </div>
            <ThemeToggle />
            <span className="hidden border-l border-line pl-4 text-xs text-taupe sm:block">
              {email}
            </span>
          </header>
          <main className="px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}