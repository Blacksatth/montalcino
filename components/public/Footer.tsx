import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 sm:grid-cols-2 md:grid-cols-3">
        {/* Brand */}
        <div>
          <p className="font-serif text-lg tracking-[0.15em]">Montalchino</p>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-taupe/70">
            Colecciones exclusivas confeccionadas para durar. Cada pieza cuenta una
            historia.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-taupe/60">
            Navegación
          </p>
          <ul className="mt-4 space-y-2.5 text-xs">
            <li>
              <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/buscar" className="text-foreground/60 transition-colors hover:text-foreground">
                Explorar todo
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="text-foreground/60 transition-colors hover:text-foreground">
                Mi carrito
              </Link>
            </li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-taupe/60">
            Información
          </p>
          <ul className="mt-4 space-y-2.5 text-xs">
            <li className="text-foreground/60">Envíos dentro de Colombia</li>
            <li className="text-foreground/60">Política de cambios y devoluciones</li>
            <li className="text-foreground/60">Contacto: hola@montalchino.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line/60 px-6 py-5">
        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-taupe/40">
          © {new Date().getFullYear()} Montalchino — Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}